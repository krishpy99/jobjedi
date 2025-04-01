import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

class PineconeService {
  private pinecone!: Pinecone; // Definite assignment assertion
  private index!: ReturnType<Pinecone['index']>; // Definite assignment assertion
  private isInitialized = false;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_API_KEY;
    this.indexName = process.env.PINECONE_INDEX_NAME || 'jobjedi-index';

    if (!apiKey) {
      console.warn('Pinecone API key not provided. Vector search functionality will be disabled.');
      return;
    }

    try {
      this.pinecone = new Pinecone({ apiKey });
      this.initializeIndex().catch(error => {
        console.error('Error during Pinecone initialization:', error);
        this.isInitialized = false;
      });
    } catch (error) {
      console.error('Error creating Pinecone instance:', error);
      this.isInitialized = false;
    }
  }

  private async initializeIndex() {
    try {
      // Set a timeout for the entire initialization process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Pinecone initialization timed out after 10 seconds')), 10000);
      });

      // Try to initialize with a timeout
      await Promise.race([this.doInitializeIndex(), timeoutPromise])
        .then(() => {
          this.isInitialized = true;
          console.log('Pinecone initialized successfully');
        })
        .catch(error => {
          console.error('Pinecone initialization failed:', error.message);
          this.isInitialized = false;
          // Continue execution even if Pinecone fails
          console.log('Continuing with fallback text-based search...');
        });
    } catch (error) {
      console.error('Error in initializeIndex wrapper:', error);
      this.isInitialized = false;
    }
  }

  private async doInitializeIndex() {
    // Properly handle Pinecone IndexList response
    const indexesList = await this.pinecone.listIndexes();
    const indexExists = indexesList.indexes?.some(index => index.name === this.indexName);

    if (!indexExists) {
      console.log(`Creating new Pinecone index: ${this.indexName}`);
      await this.pinecone.createIndex({
        name: this.indexName,
        dimension: 1536,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-west-2'
          }
        }
      });
      
      // Reduced wait time for index initialization to 10 seconds max
      // If this is insufficient, the application will still work with fallback
      console.log('Waiting for index to initialize (max 10 sec)...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    this.index = this.pinecone.Index(this.indexName);
  }

  // Maintain backward compatibility with old method name
  async storeJobWithEmbedding(userId: string, jobId: string, jobDescription: string, metadata: any) {
    // You'll need to generate embeddings here using your embedding model
    const embedding = await this.generateEmbedding(jobDescription);
    return this.storeJobEmbedding(userId, jobId, embedding, metadata);
  }

  async storeJobEmbedding(userId: string, jobId: string, embedding: number[], metadata: any) {
    if (!this.isInitialized) return { success: false, reason: 'service_not_initialized' };

    try {
      await this.index.namespace(userId).upsert([{
        id: jobId,
        values: embedding,
        metadata: metadata
      }]);
      return { success: true };
    } catch (error) {
      console.error('Error storing embedding:', error);
      return { success: false, error };
    }
  }

  // Updated query method that works with text
  async queryWithText(userId: string, text: string, topK: number = 5) {
    if (!this.isInitialized) {
      console.log('Pinecone not initialized, using fallback search...');
      return this.fallbackTextSearch(userId, text, topK);
    }
    
    try {
      // Set a timeout for the query
      const queryPromise = async () => {
        const embedding = await this.generateEmbedding(text);
        const result = await this.index.namespace(userId).query({
          topK,
          vector: embedding,
          includeMetadata: true
        });
        return result.matches || [];
      };
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Pinecone query timed out after 5 seconds')), 5000);
      });
      
      // Race the query against the timeout
      return await Promise.race([queryPromise(), timeoutPromise])
        .catch(error => {
          console.error('Error or timeout querying Pinecone:', error.message);
          return this.fallbackTextSearch(userId, text, topK);
        });
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      return this.fallbackTextSearch(userId, text, topK);
    }
  }

  // Maintain backward compatibility with old method name
  async deleteEmbedding(userId: string, jobId: string) {
    return this.deleteJobEmbedding(userId, jobId);
  }

  async deleteJobEmbedding(userId: string, jobId: string) {
    if (!this.isInitialized) return { success: false, reason: 'service_not_initialized' };

    try {
      await this.index.namespace(userId).deleteOne(jobId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting embedding:', error);
      return { success: false, error };
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Implement your embedding generation logic here
    // Example using OpenAI:
    // const response = await openai.embeddings.create({
    //   model: "text-embedding-ada-002",
    //   input: text
    // });
    // return response.data[0].embedding;
    
    // Just a dummy implementation for the sake of testing
    // In production, you would use a real embedding model
    console.log('Using dummy embeddings (should be replaced in production)');
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
  
  // Fallback text-based search when Pinecone is not available
  private async fallbackTextSearch(userId: string, query: string, topK: number = 5): Promise<any[]> {
    console.log('Using fallback text-based search');
    // This is where you could implement a simple text-based search
    // For now, return an empty array or mock data
    // In a real implementation, you might query your database directly
    return [];
  }
}

export default new PineconeService();