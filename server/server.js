// server/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import quotationRoutes from './routes/quotationRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import lpoRoutes from './routes/lpoRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import deliveryNoteRoutes from './routes/deliveryNoteRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import sharingRoutes from './routes/sharingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Configure environment variables
dotenv.config();

// Initialize express app
const app = express();

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security and utility middleware
app.use(helmet());
app.use(morgan('combined'));

// Configure CORS - ensure frontend origins are included
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative local dev
    process.env.FRONTEND_URL || '*'  // Production frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directories exist
const uploadDirs = [
  'uploads',
  'uploads/lpo',
  'uploads/quotations',
  'uploads/invoices',
  'uploads/payments',
  'uploads/delivery-notes'
];

uploadDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry logic
    if (process.env.NODE_ENV !== 'production') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1);
    }
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/quotations', quotationRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/lpos', lpoRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/share', sharingRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: Object.values(err.errors).map(error => error.message)
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate Key Error',
      details: err.keyValue
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with dynamic port selection
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Email service is temporarily disabled
    console.log('Email service is disabled');
    
    // Function to try different ports if the default one is in use
    const tryPort = (port) => {
      return new Promise((resolve, reject) => {
        const server = app.listen(port)
          .on('listening', () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
            resolve(server);
          })
          .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              console.log(`Port ${port} is busy, trying port ${port + 1}...`);
              server.close();
              resolve(tryPort(port + 1));
            } else {
              reject(err);
            }
          });
      });
    };
    
    // Start server with automatic port retry
    await tryPort(PORT);
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Log the error but don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log the error but don't exit in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start the server
startServer();