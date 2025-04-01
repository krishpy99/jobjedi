import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Resume, ResumeCreateDTO } from '../models/resume.model';
import { tfidfService } from '../services/tfidf.service';

export const createResume = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { jdText, resumeText, alias } = req.body as ResumeCreateDTO;

    // Validate input
    if (!jdText || !resumeText) {
      return res.status(400).json({ error: 'Job description and resume text are required' });
    }

    // Check if alias exists for this user
    if (alias) {
      const existingResume = await getRepository(Resume).findOne({ where: { userId, alias } });
      if (existingResume) {
        return res.status(400).json({ error: `Resume with alias '${alias}' already exists` });
      }
    }

    // Create new resume
    const resume = getRepository(Resume).create({
      jdText,
      resumeText,
      alias,
      userId
    });

    const savedResume = await getRepository(Resume).save(resume);

    return res.status(201).json(savedResume);
  } catch (error) {
    console.error('Error creating resume:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllResumes = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const resumes = await getRepository(Resume).find({ where: { userId } });
    return res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const resume = await getRepository(Resume).findOne({ where: { id, userId } });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    return res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResumeByAlias = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { alias } = req.params;
    const resume = await getRepository(Resume).findOne({ where: { userId, alias } });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    return res.json(resume);
  } catch (error) {
    console.error('Error fetching resume by alias:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const resume = await getRepository(Resume).findOne({ where: { id, userId } });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await getRepository(Resume).remove(resume);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting resume:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchResumes = async (req: Request, res: Response) => {
  try {
    // Get user from middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { query } = req.query as { query: string };
    const limit = Number(req.query.limit || 3);

    if (!query || query.length < 5) {
      return res.status(400).json({ error: 'Search query must be at least 5 characters' });
    }

    // Get all user's resumes
    const resumes = await getRepository(Resume).find({ where: { userId } });

    if (!resumes.length) {
      return res.json([]);
    }

    // Perform TF-IDF search
    const results = tfidfService.searchResumes(query, resumes);

    // Return top N results
    return res.json(results.slice(0, limit));
  } catch (error) {
    console.error('Error searching resumes:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
