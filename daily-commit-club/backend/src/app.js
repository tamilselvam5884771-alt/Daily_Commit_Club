import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import devRoutes from './routes/devRoutes.js';
import { testNotification } from './controllers/challengeController.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
);

// Logging Middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      code: 'TOO_MANY_REQUESTS'
    }
  }
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } else {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/challenge', challengeRoutes);

// Dev / Simulation routes
app.use('/api/dev', devRoutes);
app.post('/api/notifications/test/:userId', testNotification);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
