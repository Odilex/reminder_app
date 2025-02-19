import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import { cacheService } from './services/cache.js';

// Routes
import authRoutes from './routes/auth.js';
import reminderRoutes from './routes/reminders.js';
import sharedRoutes from './routes/shared.js';
import aiRoutes from './routes/ai.js';

// Services
import { schedulerService } from './services/scheduler.js';
import { aiService } from './services/ai.js';

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Firebase-Token'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Initialize services and database connections
const initializeApp = async () => {
  try {
    logger.info('Starting service initialization...');

    // Initialize Firebase
    const firebase = await import('./config/firebase.js');
    logger.info('Firebase configuration loaded');

    // Initialize other services
    await Promise.all([
      aiService.initialize().then(() => logger.info('AI service initialized')),
      cacheService.initialize().then(() => logger.info('Cache service initialized')),
      schedulerService.initialize().then(() => logger.info('Scheduler service initialized'))
    ]);

    logger.info('All services initialized successfully');

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
          firebase: true,
          cache: true,
          scheduler: true,
          ai: true,
        },
      });
    });

    // Error handling middleware
    app.use((err, req, res, _next) => {
      logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production'
          ? 'An error occurred'
          : err.message,
      });
    });

    // Start the server
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');

      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to initialize app:', error);
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