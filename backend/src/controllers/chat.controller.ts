import { Request, Response } from 'express';
import JobModel, { IJob } from '../models/job.model';
import openAIService from '../services/openai.service';
import pineconeService from '../services/pinecone.service';

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, userEmail } = req.body;

    if (!question || !userEmail) {
      return res.status(400).json({ error: 'Question and user email are required' });
    }

    // Generate embedding for the question
    const questionEmbedding = await openAIService.generateEmbedding(question);

    // Find similar job descriptions in Pinecone
    const matches = await pineconeService.querySimilar(questionEmbedding, 5);

    // Filter for matches that belong to this user
    const userMatches = matches.filter((match: any) => {
      return match.metadata && match.metadata.userEmail === userEmail;
    });
    
    // Extract job URLs from matches
    const jobUrls = userMatches.map((match: any) => {
      // Extract jobUrl from the Pinecone ID
      const parts = match.id.split('|||');
      return parts.length > 1 ? parts[1] : null;
    }).filter(Boolean);

    // Fetch jobs from PostgreSQL
    const jobs: IJob[] = [];
    for (const jobUrl of jobUrls) {
      const job = await JobModel.getJob(userEmail, jobUrl);
      if (job) {
        jobs.push(job);
      }
    }

    // Get job descriptions
    const jobDescriptions = jobs.map((job) => {
      return `Job at ${job.companyName} for position ${job.position}:\n${job.jobDescription}`;
    });

    // Generate answer using OpenAI
    const answer = await openAIService.answerJobQuestion(question, jobDescriptions);

    // Prepare job references (without full descriptions)
    const jobReferences = jobs.map((job) => ({
      userEmail: job.userEmail,
      companyName: job.companyName,
      position: job.position,
      jobUrl: job.jobUrl,
    }));

    res.json({
      success: true,
      question,
      answer,
      relatedJobs: jobReferences,
    });
  } catch (error: any) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}; 