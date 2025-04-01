import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import jobRoutes from './routes/job.routes';
import authRoutes from './routes/auth.routes';
import coverLetterRoutes from './routes/coverLetter.routes';
import chatRoutes from './routes/chat.routes';
import resumeRoutes from './routes/resume.routes';
import { initializeDatabase } from './db/init';
import { clerkAuth } from './middleware/auth.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Apply Clerk auth middleware globally
// This adds the auth property to the request but doesn't reject unauthenticated requests
// Individual routes will use authenticateToken middleware for protected endpoints
app.use(clerkAuth);

// Initialize the database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error: Error) => {
    console.error('Database initialization error:', error);
  });

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resumes', resumeRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 