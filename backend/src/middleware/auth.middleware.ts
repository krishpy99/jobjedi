import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // For development purposes, we'll use a simple mock authentication
  // In production, this would verify tokens from headers
  
  // Extract user email from request body or query params
  const userEmail = req.body.userEmail || req.query.userEmail;
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Set user in request object
  req.user = {
    id: userEmail, // Using email as ID for simplicity
    email: userEmail
  };
  
  next();
};
