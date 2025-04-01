import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import dotenv from 'dotenv';
import { jwtDecode } from "jwt-decode";

dotenv.config();

interface CustomToken {
  email: string;
  id: string;
}

// Ensure Clerk API key is set
if (!process.env.CLERK_SECRET_KEY) {
  console.error('CLERK_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      auth?: any; // The auth object will be added by Clerk middleware
    }
  }
}

// Clerk middleware to validate token and extract session/user data
export const clerkAuth = clerkMiddleware();

const getCustomInfo = async (getToken: any) => {
  const template = 'authjedi';
  const token = await getToken({ template });
  console.log('Token:', token);
  // break down this jwt from clerk to get info like we did for auth token
  const decoded = jwtDecode(token);
  return decoded as CustomToken;
};

// Middleware to extract user from Clerk auth and store in req.user
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Use getAuth helper instead of casting to ClerkRequest
  const auth = getAuth(req);
  
  if (!auth?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // If we have auth data from Clerk
    console.log('Auth data:', auth);
    if (auth.userId) {
      const getToken = await auth.getToken;
      const customToken: CustomToken = await getCustomInfo(getToken);
      console.log('Custom info:', customToken);
      req.user = {
        id: customToken?.id,
        email: customToken?.email
      };
      return next();
    }
    
    return res.status(401).json({ error: 'Email information not available' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};
