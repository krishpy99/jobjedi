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
        
        // Wait for index initialization
        await new Promise(resolve => setTimeout(resolve, 60000));
      }

      this.index = this.pinecone.Index(this.indexName);
      this.isInitialized = true;
      console.log('Pinecone initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      this.isInitialized = false;
    }
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
    if (!this.isInitialized) return [];
    
    try {
      const embedding = await this.generateEmbedding(text);
      const result = await this.index.namespace(userId).query({
        topK,
        vector: embedding,
        includeMetadata: true
      });
      return result.matches || [];
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      return [];
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
    
    // Dummy implementation
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }
}

export default new PineconeService();