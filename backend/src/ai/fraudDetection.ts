// ============================================================================
// ClaimShield AI - Fraud Detection Analytics Service
// ============================================================================

import prisma from '../config/database';
import { FraudAnalysis, FraudIndicator } from '../types';

/**
 * Checks for record duplicates in the database based on the SHA-256 hash.
 */
export const detectDuplicateRecord = async (
  fileHash: string,
  patientId: string
): Promise<{ isDuplicate: boolean; duplicateRecordId?: string }> => {
  const existingRecord = await prisma.medicalRecord.findFirst({
    where: {
      blockchainHash: fileHash,
    },
  });

  if (existingRecord) {
    return {
      isDuplicate: true,
      duplicateRecordId: existingRecord.id,
    };
  }

  return {
    isDuplicate: false,
  };
};

/**
 * Calculates a comprehensive fraud score (0-100) and lists key indicators.
 */
export const analyzeFraudRisk = async (params: {
  patientId: string;
  fileHash: string;
  isDuplicate: boolean;
  claimAmount?: number;
  ocrText: string;
  blockchainMismatch: boolean;
}): Promise<FraudAnalysis> => {
  const indicators: FraudIndicator[] = [];
  let overallScore = 0;

  // 1. Check for Blockchain Tampering/Mismatch (Highest Risk)
  if (params.blockchainMismatch) {
    indicators.push({
      type: 'HASH_MISMATCH',
      severity: 'CRITICAL',
      description: 'Cryptographic hash mismatch. Stored blockchain hash does not match the file hash!',
      score: 100,
    });
    overallScore = 100;
  }

  // 2. Check for Duplicate File Uploads
  if (params.isDuplicate) {
    indicators.push({
      type: 'DUPLICATE_FILE',
      severity: 'HIGH',
      description: 'Identical file content hash already exists on the ledger. Possible double-claim attempt.',
      score: 60,
    });
    overallScore = Math.max(overallScore, 60);
  }

  // 3. Upload Frequency / Rapid Uploads (Spam/Script detection)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentUploadsCount = await prisma.medicalRecord.count({
    where: {
      patientId: params.patientId,
      createdAt: {
        gte: tenMinutesAgo,
      },
    },
  });

  if (recentUploadsCount >= 3) {
    indicators.push({
      type: 'RAPID_UPLOADS',
      severity: 'MEDIUM',
      description: `High frequency upload detected: ${recentUploadsCount} files uploaded in the last 10 minutes.`,
      score: 35,
    });
    overallScore = Math.max(overallScore, 35);
  }

  // 4. Claim Amount Outlier Analysis
  if (params.claimAmount !== undefined) {
    if (params.claimAmount > 50000) {
      indicators.push({
        type: 'HIGH_CLAIM',
        severity: 'HIGH',
        description: `Outlier claim amount: $${params.claimAmount.toLocaleString()} exceeds average billing limits.`,
        score: 50,
      });
      overallScore = Math.max(overallScore, 50);
    } else if (params.claimAmount > 15000) {
      indicators.push({
        type: 'HIGH_CLAIM',
        severity: 'MEDIUM',
        description: `Elevated claim amount: $${params.claimAmount.toLocaleString()} requires visual audits.`,
        score: 25,
      });
      overallScore = Math.max(overallScore, 25);
    }
  }

  // 5. Pattern Anomalies in OCR Text
  const ocrLower = params.ocrText.toLowerCase();
  const suspiciousKeywords = [
    'tamper', 'fake', 'altered', 'correction fluid', 'error in data', 
    'modified manually', 'photoshop', 'edit layer'
  ];
  const matchingKeywords = suspiciousKeywords.filter(k => ocrLower.includes(k));
  if (matchingKeywords.length > 0) {
    indicators.push({
      type: 'ANOMALOUS_PATTERN',
      severity: 'HIGH',
      description: `Suspicious system terms found in OCR text: ${matchingKeywords.join(', ')}.`,
      score: 45,
    });
    overallScore = Math.max(overallScore, 45);
  }

  // Cap score at 100
  overallScore = Math.min(overallScore, 100);

  // Determine Risk Level Category
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overallScore >= 90) riskLevel = 'CRITICAL';
  else if (overallScore >= 60) riskLevel = 'HIGH';
  else if (overallScore >= 30) riskLevel = 'MEDIUM';

  // Recommendations
  let recommendation = 'No action required. File is authentic.';
  if (riskLevel === 'CRITICAL') {
    recommendation = 'IMMEDIATE AUDIT. Halt any payouts. Verify blockchain block integrity and contact patient/doctor.';
  } else if (riskLevel === 'HIGH') {
    recommendation = 'Hold claim processing. Manual review of report, OCR metadata, and previous claims is required.';
  } else if (riskLevel === 'MEDIUM') {
    recommendation = 'Review with caution. Alert flagged for high upload frequency or elevated claim size.';
  }

  return {
    overallScore,
    riskLevel,
    indicators,
    recommendation,
  };
};
