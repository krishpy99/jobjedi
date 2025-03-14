import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

class PineconeService {
  private pinecone: any;
  private index: any;
  private namespace = 'job-descriptions';
  private isInitialized = false;

  constructor() {
    // Only initialize if API key is present
    const apiKey = process.env.PINECONE_API_KEY;
    if (apiKey) {
      try {
        // Initialize Pinecone client
        this.pinecone = new Pinecone({
          apiKey: apiKey,
        });
        
        this.initializeIndex().catch(error => {
          console.error('Error during Pinecone initialization:', error);
          this.isInitialized = false;
        });
      } catch (error) {
        console.error('Error creating Pinecone instance:', error);
        this.isInitialized = false;
      }
    } else {
      console.warn('Pinecone API key not provided. Vector search functionality will be disabled.');
      this.isInitialized = false;
    }
  }

  private async initializeIndex() {
    try {
      const indexName = process.env.PINECONE_INDEX_NAME || 'jobjedi-index';
      
      // Check if indexes is available and how it's returned from the API
      const indexesList = await this.pinecone.listIndexes();
      
      // Handle different response formats from Pinecone SDK
      const indexes = Array.isArray(indexesList) 
        ? indexesList 
        : (indexesList?.indexes || []);
      
      const indexExists = Array.isArray(indexes) && 
        indexes.some(idx => 
          typeof idx === 'string' 
            ? idx === indexName 
            : idx.name === indexName
        );
      
      if (!indexExists) {
        try {
          await this.pinecone.createIndex({
            name: indexName,
            dimension: 1536, // Dimension for text-embedding-3-small
            metric: 'cosine',
          });
          console.log(`Created Pinecone index: ${indexName}`);
        } catch (error) {
          console.error('Error creating Pinecone index:', error);
          this.isInitialized = false;
          return;
        }
      }
      
      // Get the index
      this.index = this.pinecone.Index(indexName);
      this.isInitialized = true;
      console.log('Pinecone index initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      this.isInitialized = false;
    }
  }

  // Store job description embeddings
  // jobId is now a string combining user_email and job_url: "user@email.com|||http://job.url"
  async storeEmbedding(jobId: string, embedding: number[], metadata: any) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Skipping vector storage.');
      return { success: false, reason: 'service_not_initialized' };
    }
    
    try {
      await this.index.upsert({
        vectors: [
          {
            id: jobId,
            values: embedding,
            metadata,
          },
        ],
        namespace: this.namespace,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error storing embedding in Pinecone:', error);
      return { success: false, error };
    }
  }

  // Query similar job descriptions
  async querySimilar(embedding: number[], topK: number = 5) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Returning empty similarity results.');
      return [];
    }
    
    try {
      const queryResponse = await this.index.query({
        vector: embedding,
        topK,
        includeMetadata: true,
        namespace: this.namespace,
      });
      
      return queryResponse.matches || [];
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      return [];
    }
  }

  // Delete a job's embedding
  // jobId is now a string combining user_email and job_url: "user@email.com|||http://job.url"
  async deleteEmbedding(jobId: string) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Skipping vector deletion.');
      return { success: false, reason: 'service_not_initialized' };
    }
    
    try {
      await this.index.delete({
        ids: [jobId],
        namespace: this.namespace,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting embedding from Pinecone:', error);
      return { success: false, error };
    }
  }
}

export default new PineconeService(); 