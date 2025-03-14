import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class OpenAIService {
  private openai: OpenAI;
  private embeddingModel: string = 'text-embedding-3-small';
  private chatModel: string = 'gpt-4o-mini';

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Generate embeddings for a text
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  // Generate a cover letter based on job description and optional custom info
  async generateCoverLetter(jobDescription: string, customInfo?: string): Promise<string> {
    try {
      const systemPrompt = `You are a professional cover letter writer.
      Create a compelling, personalized cover letter for the job description provided.
      Make it sound professional but natural, with a confident tone.
      The letter should be well-structured with a clear introduction, body paragraphs highlighting relevant experience, and a strong conclusion.
      Keep it concise (less than 400 words) and focused on highlighting the candidate's most relevant skills and experiences for the position.`;

      let userPrompt = `Generate a cover letter for the following job description:\n\n${jobDescription}`;
      
      if (customInfo) {
        userPrompt += `\n\nInclude the following personal information and experience:\n${customInfo}`;
      }

      const response = await this.openai.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }

  // Answer questions based on job descriptions (RAG implementation)
  async answerJobQuestion(question: string, jobDescriptions: string[]): Promise<string> {
    try {
      const context = jobDescriptions.join('\n\n---\n\n');
      
      const systemPrompt = `You are an AI assistant helping with job applications.
      Answer the user's question based on the provided job descriptions.
      If the information is not in the job descriptions, clearly state that you don't have that information.
      Be concise, helpful, and professional.`;

      const response = await this.openai.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I have the following job descriptions:\n\n${context}\n\nMy question is: ${question}` }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error answering job question:', error);
      throw error;
    }
  }
}

export default new OpenAIService(); 