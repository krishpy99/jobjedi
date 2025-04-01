import { Request, Response } from 'express';
import JobModel, { IJob } from '../models/job.model';
import pineconeService from '../services/pinecone.service';

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, userEmail } = req.body;

    if (!question || !userEmail) {
      return res.status(400).json({ error: 'Question and user email are required' });
    }

    // Find similar job descriptions in Pinecone using text directly
    const matches = await pineconeService.queryWithText(userEmail, question, 5) as Array<{id: string, metadata?: {userEmail?: string}, score?: number}>;

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

    // Prepare job references (without full descriptions)
    const jobReferences = jobs.map((job) => ({
      userEmail: job.userEmail,
      companyName: job.companyName,
      position: job.position,
      jobUrl: job.jobUrl,
      jobDescription: job.jobDescription.substring(0, 200) + "..." // Include a preview of the job description
    }));

    // Instead of generating an answer with OpenAI, return relevant jobs
    // Client can display the job details to the user as search results
    res.json({
      success: true,
      question,
      message: "Here are the most relevant jobs based on your question:",
      relatedJobs: jobReferences,
    });
  } catch (error: any) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}; 