import { Request, Response } from 'express';
import JobModel from '../models/job.model';
import pineconeService from '../services/pinecone.service';

export const addJob = async (req: Request, res: Response) => {
  try {
    const { companyName, position, jobDescription, jobUrl, userEmail } = req.body;

    // Input validation
    if (!companyName || !position || !jobDescription || !jobUrl || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create job in PostgreSQL with Pinecone ID
    const job = await JobModel.createJob({
      userEmail,
      companyName,
      position,
      jobDescription,
      jobUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Job created:', job);

    // Store job in Pinecone with integrated embedding
    await pineconeService.storeJobWithEmbedding(userEmail, jobUrl, jobDescription, {
      companyName,
      position,
      jobUrl,
      userEmail
    });

    res.status(201).json({
      success: true,
      job: {
        userEmail: job.userEmail,
        companyName: job.companyName,
        position: job.position,
        jobUrl: job.jobUrl,
      },
    });
  } catch (error: any) {
    console.error('Error adding job:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Get all jobs from PostgreSQL for this user, sorted by date (newest first)
    const jobs = await JobModel.getJobsByUser(userEmail);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const jobId = req.params.jobId;

    if (!userEmail || !jobId) {
      return res.status(400).json({ error: 'User email and job ID are required' });
    }

    const job = await JobModel.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      job,
    });
  } catch (error: any) {
    console.error('Error fetching job by ID:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userEmail = req.user?.email;
    const jobId = req.params.jobId;

    if (!userEmail || !jobId) {
      return res.status(400).json({ error: 'User email and job ID are required' });
    }

    const deleted = await JobModel.deleteJob(jobId);

    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete embeddings from Pinecone
    await pineconeService.deleteEmbedding(userEmail, jobId);

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const userEmail = req.user?.email;

    if (!query || !userEmail) {
      return res.status(400).json({ error: 'Query parameter and user email are required' });
    }

    // Search using PostgreSQL text search
    const jobs = await JobModel.searchJobs(userEmail, query);

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error: any) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const semanticSearch = async (req: Request, res: Response) => {
  try {
    const query = req.body.query as string;
    const userEmail = req.user?.email as string;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const matches = await pineconeService.queryWithText(userEmail, query) as Array<{id: string, metadata?: {userEmail?: string}, score?: number}>;

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
    const jobs = [];
    for (const jobId of jobUrls) {
      const job = await JobModel.getJob(jobId);
      if (job) {
        jobs.push(job);
      }
    }

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error: any) {
    console.error('Error performing semantic search:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}; 