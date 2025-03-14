import { Request, Response } from 'express';
import JobModel from '../models/job.model';
import openAIService from '../services/openai.service';
import pineconeService from '../services/pinecone.service';

export const addJob = async (req: Request, res: Response) => {
  try {
    const { companyName, position, jobDescription, jobUrl, userEmail } = req.body;

    // Input validation
    if (!companyName || !position || !jobDescription || !jobUrl || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate embeddings for the job description
    const embeddings = await openAIService.generateEmbedding(jobDescription);

    // Create job in PostgreSQL
    const job = await JobModel.createJob({
      userEmail,
      companyName,
      position,
      jobDescription,
      jobUrl,
      embeddings,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create a unique ID for Pinecone by combining userEmail and jobUrl
    const pineconeId = `${userEmail}|||${jobUrl}`;

    // Store embeddings in Pinecone
    await pineconeService.storeEmbedding(pineconeId, embeddings, {
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
    // Get user email from request (could be from auth middleware)
    const userEmail = req.query.userEmail as string;
    
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
    const userEmail = req.query.userEmail as string;
    const jobUrl = req.params.jobUrl;

    if (!userEmail || !jobUrl) {
      return res.status(400).json({ error: 'User email and job URL are required' });
    }

    const job = await JobModel.getJob(userEmail, jobUrl);

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
    const userEmail = req.query.userEmail as string;
    const jobUrl = req.params.jobUrl;

    if (!userEmail || !jobUrl) {
      return res.status(400).json({ error: 'User email and job URL are required' });
    }

    const deleted = await JobModel.deleteJob(userEmail, jobUrl);

    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Create a unique ID for Pinecone by combining userEmail and jobUrl
    const pineconeId = `${userEmail}|||${jobUrl}`;

    // Delete embeddings from Pinecone
    await pineconeService.deleteEmbedding(pineconeId);

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
    const userEmail = req.query.userEmail as string;

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
    const { query, userEmail } = req.body;

    if (!query || !userEmail) {
      return res.status(400).json({ error: 'Query and user email are required in the request body' });
    }

    // Generate embeddings for the query
    const queryEmbedding = await openAIService.generateEmbedding(query);

    // Search similar job descriptions using Pinecone
    const matches = await pineconeService.querySimilar(queryEmbedding);

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
    for (const jobUrl of jobUrls) {
      const job = await JobModel.getJob(userEmail, jobUrl);
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