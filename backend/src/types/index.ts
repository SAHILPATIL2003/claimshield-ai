// ============================================================================
// ClaimShield AI - TypeScript Type Definitions
// ============================================================================

import { Request } from 'express';

// ── User Types ──────────────────────────────────────────────────────────────
export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export interface JWTPayload {
  userId: string;
  role: Role;
  mobileNumber: string;
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  file?: Express.Multer.File;
}

// ── API Response Types ──────────────────────────────────────────────────────
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Auth Types ──────────────────────────────────────────────────────────────
export interface VerifyOTPRequest {
  firebaseToken: string;
}

export interface SetRoleRequest {
  role: Role;
  fullName: string;
  hospitalId?: string;
}

export interface DemoLoginRequest {
  mobileNumber: string;
  role: Role;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    role: Role;
    mobileNumber: string;
    fullName: string;
    avatar?: string;
    hospitalId?: string;
  };
}

// ── Medical Record Types ────────────────────────────────────────────────────
export interface UploadRecordResponse {
  record: {
    id: string;
    fileName: string;
    fileUrl: string;
    blockchainHash: string;
    txId: string;
    verificationStatus: string;
    aiSummary: string | null;
    ocrText: string | null;
    fraudScore: number;
    createdAt: Date;
  };
  blockchain: {
    blockIndex: number;
    blockHash: string;
    previousHash: string;
    verified: boolean;
  };
}

export interface VerificationResult {
  recordId: string;
  isValid: boolean;
  storedHash: string;
  blockchainHash: string;
  blockIndex: number;
  timestamp: Date;
  tamperingDetected: boolean;
  chainIntegrity: boolean;
}

// ── Blockchain Types ────────────────────────────────────────────────────────
export interface BlockData {
  recordId: string;
  fileHash: string;
  uploadedBy: string;
  action: 'UPLOAD' | 'VERIFY' | 'DELETE' | 'UPDATE';
}

export interface Block {
  index: number;
  timestamp: string;
  data: BlockData;
  previousHash: string;
  hash: string;
  nonce: number;
}

// ── Analytics Types ─────────────────────────────────────────────────────────
export interface AnalyticsDashboard {
  totalUsers: number;
  totalRecords: number;
  totalClaims: number;
  fraudAlerts: number;
  verifiedRecords: number;
  flaggedRecords: number;
  pendingClaims: number;
  totalBlockchainBlocks: number;
  recentActivity: any[];
  recordsByMonth: { month: string; count: number }[];
  fraudScoreDistribution: { range: string; count: number }[];
  claimsByStatus: { status: string; count: number }[];
}

// ── Fraud Detection Types ───────────────────────────────────────────────────
export interface FraudIndicator {
  type: 'HASH_MISMATCH' | 'DUPLICATE_FILE' | 'ANOMALOUS_PATTERN' | 'HIGH_CLAIM' | 'RAPID_UPLOADS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  score: number;
}

export interface FraudAnalysis {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  indicators: FraudIndicator[];
  recommendation: string;
}

// ── AI Summary Types ────────────────────────────────────────────────────────
export interface MedicalSummary {
  patientName: string | null;
  date: string | null;
  reportType: string;
  keyFindings: string[];
  abnormalities: string[];
  recommendations: string[];
  summary: string;
}

// ── QR Code Types ───────────────────────────────────────────────────────────
export interface QRVerificationData {
  recordId: string;
  blockchainHash: string;
  verifiedAt: string;
  verificationUrl: string;
}
