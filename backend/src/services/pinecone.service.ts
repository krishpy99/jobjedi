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
          console.log('Creating new Pinecone index with integrated embedding model...');
          
          // Create index with integrated embedding model
          await this.pinecone.createIndex({
            name: indexName,
            dimension: 1536, // Will be ignored when using a text model
            metric: 'cosine',
            spec: {
              serverless: {
                cloud: 'aws',
                region: 'us-west-2'
              }
            },
            textModel: { // Specify the text model for integrated embeddings
              name: 'multilingual-e5-large', // Using a strong multilingual model for embeddings
              sourceField: 'text', // Field that contains the text to embed
            }
          });
          console.log(`Created Pinecone index: ${indexName}`);
        } catch (error) {
          console.error('Error creating Pinecone index:', error);
          this.isInitialized = false;
          return;
        }
      } else {
        console.log(`Pinecone index ${indexName} already exists`);
      }
      
      // Get the index
      this.index = this.pinecone.Index(indexName);
      
      // Store index stats for later use to determine if we're using a text model
      try {
        const stats = await this.index.describeIndexStats();
        console.log('Index stats:', JSON.stringify(stats, null, 2));
        this.index.indexStats = stats;
        
        // Log whether we're using integrated embeddings
        if (stats.dimension === undefined) {
          console.log('Using integrated embeddings with Pinecone');
        } else {
          console.log(`Using standard vectors with dimension: ${stats.dimension}`);
        }
      } catch (error) {
        console.warn('Could not fetch index stats:', error);
      }
      
      this.isInitialized = true;
      console.log('Pinecone index initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      this.isInitialized = false;
    }
  }

  // Store job with integrated embedding (to replace the old storeEmbedding method)
  async storeJobWithEmbedding(jobId: string, jobDescription: string, metadata: any) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Skipping vector storage.');
      return { success: false, reason: 'service_not_initialized' };
    }
    
    try {
      // Validate inputs
      if (!jobId || !jobDescription) {
        console.error('Invalid inputs for Pinecone upsert - missing jobId or jobDescription');
        return { success: false, reason: 'invalid_inputs' };
      }

      // Ensure metadata is an object
      const safeMetadata = metadata || {};
      
      // Check if we're using a text model (integrated embeddings)
      const hasTextModel = this.index.indexStats?.dimension === undefined;
      
      if (hasTextModel) {
        // For indexes with integrated embeddings, use upsert with the correct format
        console.log('Using integrated embeddings for Pinecone upsert');
        
        await this.index.upsert({
          vectors: [
            {
              id: jobId,
              // No values needed for integrated embeddings
              metadata: {
                ...safeMetadata,
                text: jobDescription // This is the field that will be embedded
              }
            }
          ],
          namespace: this.namespace
        });
      } else {
        // For standard indexes, we need to provide dummy values for now
        // In a real implementation, you'd generate these using an embedding model
        console.log('Using standard vector format for Pinecone upsert');
        
        // Create a dummy vector of dimension 1536 (typical for models like OpenAI)
        // In production, replace this with actual embeddings from your model
        const dummyValues = Array(1536).fill(0).map(() => Math.random() * 2 - 1);
        
        await this.index.upsert({
          vectors: [
            {
              id: jobId,
              values: dummyValues, // REQUIRED: Values array for the vector
              metadata: {
                ...safeMetadata,
                text: jobDescription
              }
            }
          ],
          namespace: this.namespace
        });
      }
      
      console.log(`Vector successfully upserted with id: ${jobId}`);
      return { success: true };
    } catch (error) {
      console.error('Error storing job with integrated embedding in Pinecone:', error);
      return { success: false, error };
    }
  }

  // Legacy method for backward compatibility
  async storeEmbedding(jobId: string, embedding: number[], metadata: any) {
    return this.storeJobWithEmbedding(jobId, metadata.jobDescription || '', metadata);
  }

  // Query similar job descriptions with text
  async queryWithText(text: string, topK: number = 5) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Returning empty similarity results.');
      return [];
    }
    
    try {
      // Validate input
      if (!text) {
        console.error('Invalid input for Pinecone query - missing text');
        return [];
      }
      
      console.log(`Querying Pinecone with text in namespace ${this.namespace}, topK=${topK}`);
      
      // Check if we're using a text model (integrated embeddings)
      const hasTextModel = this.index.indexStats?.dimension === undefined;
      
      let queryResponse;
      
      if (hasTextModel) {
        // For indexes with integrated embeddings, query with text
        console.log('Using integrated embeddings for Pinecone query');
        
        queryResponse = await this.index.query({
          topK,
          includeMetadata: true,
          namespace: this.namespace,
          queries: [
            {
              text: text // Text to be embedded by Pinecone
            }
          ]
        });
      } else {
        // For standard indexes, we need to provide dummy values for now
        // In a real implementation, you'd generate these using an embedding model
        console.log('Using standard vector format for Pinecone query');
        
        // Create a dummy vector of dimension 1536 (typical for models like OpenAI)
        // In production, replace this with actual embeddings from your model
        const dummyValues = Array(1536).fill(0).map(() => Math.random() * 2 - 1);
        
        queryResponse = await this.index.query({
          topK,
          includeMetadata: true,
          namespace: this.namespace,
          queries: [
            {
              values: dummyValues,
              filter: {} // Optional filter
            }
          ]
        });
      }
      
      // Format the response based on the structure returned
      const matches = queryResponse?.matches || 
                      (queryResponse?.results && queryResponse.results[0]?.matches) || 
                      [];
      
      console.log(`Found ${matches.length} matches`);
      
      return matches;
    } catch (error) {
      console.error('Error querying Pinecone with text:', error);
      return [];
    }
  }

  // Legacy method for backward compatibility
  async querySimilar(embedding: number[], topK: number = 5) {
    console.warn('querySimilar with vector is deprecated, use queryWithText instead');
    return [];
  }

  // Delete a job's embedding
  // jobId is now a string combining user_email and job_url: "user@email.com|||http://job.url"
  async deleteEmbedding(jobId: string) {
    if (!this.isInitialized) {
      console.warn('Pinecone not initialized. Skipping vector deletion.');
      return { success: false, reason: 'service_not_initialized' };
    }
    
    try {
      // Validate input
      if (!jobId) {
        console.error('Invalid input for Pinecone delete - missing jobId');
        return { success: false, reason: 'invalid_input' };
      }
      
      console.log(`Deleting vector with ID ${jobId} from namespace ${this.namespace}`);
      
      // Delete the vector using the correct format for Pinecone
      await this.index.delete({
        ids: [jobId],
        namespace: this.namespace
      });
      
      console.log(`Vector successfully deleted with id: ${jobId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting embedding from Pinecone:', error);
      return { success: false, error };
    }
  }
}

export default new PineconeService(); 