import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import winston from 'winston';
import { connectMongoose } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import reminderRoutes from './routes/reminders.js';
import sharedRoutes from './routes/shared.js';
import aiRoutes from './routes/ai.js';

// Services
import { cacheService } from './services/cache.js';
import { schedulerService } from './services/scheduler.js';
import './config/firebase.js';

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Initialize services and database connections
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectMongoose();
    logger.info('Connected to MongoDB');

    // Initialize Redis cache
    await cacheService.connect();
    logger.info('Connected to Redis');

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/reminders', reminderRoutes);
    app.use('/api/shared', sharedRoutes);
    app.use('/api/ai', aiRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date(),
        services: {
          mongodb: mongoose.connection.readyState === 1,
          redis: cacheService.client.isReady,
          scheduler: true
        }
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' 
          ? 'An error occurred'
          : err.message
      });
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Application initialization error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Initialize the application
initializeApp(); 