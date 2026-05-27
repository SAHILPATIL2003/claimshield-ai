// ============================================================================
// ClaimShield AI - Main Express Server Entrypoint
// ============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load Environment variables
dotenv.config();

// Imports modules
import authRoutes from './routes/auth';
import recordRoutes from './routes/records';
import patientRoutes from './routes/patients';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import { errorHandler } from './middleware/errorHandler';
import blockchainInstance from './blockchain/blockchain';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows downloading uploads locally
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure uploads folder exists for local mock files serving
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Global error handler mount
app.use(errorHandler);

// Initialize Blockchain Simulation & Listen
const startServer = async () => {
  try {
    console.log('[Blockchain Ledger] Launching blockchain ledger verification...');
    await blockchainInstance.initialize();
    
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`ClaimShield AI Backend listening on Port: ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Demo Mode active: ${process.env.DEMO_MODE === 'true'}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Critical Server Initialization Failure:', error);
    process.exit(1);
  }
};

startServer();
