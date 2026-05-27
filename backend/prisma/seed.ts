// ============================================================================
// ClaimShield AI - Database Seeding Script
// Healthcare Record Verification & Insurance Fraud Prevention
// ============================================================================

import { PrismaClient, Role, VerificationStatus, ClaimStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

const generateSHA256 = (content: string): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

async function main() {
  console.log('Clearing database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.doctorNote.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.blockchainBlock.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  console.log('Seeding hospitals...');
  const h1 = await prisma.hospital.create({
    data: {
      name: 'Care First Multispecialty Hospital',
      address: '104 Park Avenue, New York, NY',
      phone: '+1 (555) 019-2834',
      email: 'contact@carefirst.org',
    },
  });

  const h2 = await prisma.hospital.create({
    data: {
      name: 'Sacred Heart General Hospital',
      address: '500 Community Drive, Los Angeles, CA',
      phone: '+1 (555) 014-9988',
      email: 'info@sacredheart.org',
    },
  });

  const h3 = await prisma.hospital.create({
    data: {
      name: 'Apex Imaging & Radiology Services',
      address: '72 Blue Ribbon Way, Chicago, IL',
      phone: '+1 (555) 012-7711',
      email: 'billing@apeximaging.com',
    },
  });

  console.log('Seeding users...');
  
  // Patients
  const patientJohn = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      mobileNumber: '+919999999991',
      role: Role.PATIENT,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const patientJane = await prisma.user.create({
    data: {
      fullName: 'Jane Smith',
      mobileNumber: '+919999999992',
      role: Role.PATIENT,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const patientEmily = await prisma.user.create({
    data: {
      fullName: 'Emily Watson',
      mobileNumber: '+919999999993',
      role: Role.PATIENT,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  // Doctors
  const doctorVance = await prisma.user.create({
    data: {
      fullName: 'Dr. Robert Vance',
      mobileNumber: '+919999999981',
      role: Role.DOCTOR,
      hospitalId: h1.id,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    },
  });

  const doctorHouse = await prisma.user.create({
    data: {
      fullName: 'Dr. Gregory House',
      mobileNumber: '+919999999982',
      role: Role.DOCTOR,
      hospitalId: h2.id,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    },
  });

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'System Administrator',
      mobileNumber: '+919999999900',
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  // Update Hospital Admin relations
  await prisma.hospital.update({
    where: { id: h1.id },
    data: { adminId: adminUser.id },
  });
  await prisma.hospital.update({
    where: { id: h2.id },
    data: { adminId: adminUser.id },
  });

  console.log('Seeding blockchain blocks...');
  
  // Genesis Block
  const genesisHash = generateSHA256('017-05-27SYSTEMUPLOAD0');
  const b0 = await prisma.blockchainBlock.create({
    data: {
      index: 0,
      timestamp: new Date('2026-05-01T00:00:00Z'),
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      action: 'UPLOAD',
      uploadedBy: 'SYSTEM',
      previousHash: '0',
      hash: genesisHash,
      nonce: 42,
    },
  });

  console.log('Seeding medical records & auditing logs...');

  // Report 1: John Doe CBC report
  const cbcOcr = `
=========================================
METROPOLIS CLINICAL LABORATORIES
Patient: John Doe       Age/Gender: 45/M
Date: 2026-05-15        Ref Doctor: Dr. Sarah Connor
=========================================
TEST REPORT: COMPLETE BLOOD COUNT (CBC)

HAEMOGLOBIN          14.2 g/dL       (Normal: 13.0 - 17.0)
RED BLOOD CELLS      4.8 million/uL  (Normal: 4.5 - 5.5)
WHITE BLOOD CELLS    11,500 /uL      (Normal: 4,000 - 11,000) [HIGH]
PLATELET COUNT       250,000 /uL     (Normal: 150,000 - 450,000)
  `;

  const cbcSummary = {
    patientName: 'John Doe',
    date: '2026-05-15',
    reportType: 'Complete Blood Count (CBC) Report',
    keyFindings: ['Red Blood Cells count is within normal parameters.', 'Platelet count is healthy at 250,000 /uL.'],
    abnormalities: ['Elevated White Blood Cells count of 11,500 /uL (Normal: 4,000 - 11,000).'],
    recommendations: ['Investigate for signs of active infection.', 'Clinical correlation with symptoms.'],
    summary: 'The blood test indicates elevated White Blood Cell count (Leukocytosis), which suggests a mild infection or inflammatory response. All other cell lines are within normal levels.',
  };

  const fileHash1 = generateSHA256(cbcOcr);
  const r1 = await prisma.medicalRecord.create({
    data: {
      patientId: patientJohn.id,
      uploadedById: patientJohn.id,
      fileName: 'blood_report_john.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://supabase.co/storage/v1/object/public/medical-records/blood_report_john.pdf',
      fileSize: 42420,
      blockchainHash: fileHash1,
      ocrText: cbcOcr,
      aiSummary: JSON.stringify(cbcSummary),
      recordType: 'Complete Blood Count (CBC) Report',
      verificationStatus: VerificationStatus.VERIFIED,
      createdAt: new Date('2026-05-15T10:00:00Z'),
    },
  });

  // Block 1 matching Report 1
  const b1Hash = generateSHA256(`1${new Date('2026-05-15T10:01:00Z').toISOString()}${r1.id}${fileHash1}${genesisHash}`);
  const block1 = await prisma.blockchainBlock.create({
    data: {
      index: 1,
      timestamp: new Date('2026-05-15T10:01:00Z'),
      recordId: r1.id,
      fileHash: fileHash1,
      action: 'UPLOAD',
      uploadedBy: patientJohn.id,
      previousHash: b0.hash,
      hash: b1Hash,
      nonce: 104,
    },
  });

  await prisma.medicalRecord.update({
    where: { id: r1.id },
    data: { txId: block1.hash },
  });

  // Notes on CBC Report by Dr. Vance
  await prisma.doctorNote.create({
    data: {
      recordId: r1.id,
      doctorId: doctorVance.id,
      content: 'CBC reviewed. Mild elevated WBC counts are likely linked to reports of mild upper respiratory symptoms. Follow up with patient in 7 days.',
      createdAt: new Date('2026-05-16T14:20:00Z'),
    },
  });

  // Audit log CBC
  await prisma.auditLog.create({
    data: {
      userId: patientJohn.id,
      action: 'RECORD_UPLOAD',
      details: 'Uploaded file blood_report_john.pdf. Cryptographic anchor mined in Block 1.',
      createdAt: new Date('2026-05-15T10:00:00Z'),
    },
  });

  // Report 2: Jane Smith Chest X-Ray
  const xrayOcr = `
=========================================
APEX IMAGING & RADIOLOGY SERVICES
Patient: Jane Smith     Age/Gender: 32/F
Date: 2026-05-20        Ref Doctor: Dr. Alfred Miller
=========================================
REPORT: CHEST X-RAY (PA VIEW)
- Ill-defined patchy opacities seen in the right lower lobe, suspicious for pneumonia.
- Cardiac silhouette is normal. Costophrenic angles are clear.
  `;

  const xraySummary = {
    patientName: 'Jane Smith',
    date: '2026-05-20',
    reportType: 'Chest X-Ray Radiographic Report',
    keyFindings: ['Costophrenic angles are clear.', 'Cardiac silhouette is normal.'],
    abnormalities: ['Patchy opacities in the right lower lobe, suspicious for early pneumonia.'],
    recommendations: ['Antibiotic therapy coverage.', 'Sputum culture testing.'],
    summary: 'The chest radiograph reveals patchy opacities in the right lower lobe, indicating early pneumonia consolidation.',
  };

  const fileHash2 = generateSHA256(xrayOcr);
  const r2 = await prisma.medicalRecord.create({
    data: {
      patientId: patientJane.id,
      uploadedById: patientJane.id,
      fileName: 'chest_xray_smith.png',
      fileType: 'image/png',
      fileUrl: 'https://supabase.co/storage/v1/object/public/medical-records/chest_xray_smith.png',
      fileSize: 182300,
      blockchainHash: fileHash2,
      ocrText: xrayOcr,
      aiSummary: JSON.stringify(xraySummary),
      recordType: 'Chest X-Ray Radiographic Report',
      verificationStatus: VerificationStatus.VERIFIED,
      createdAt: new Date('2026-05-20T08:30:00Z'),
    },
  });

  // Block 2 matching Report 2
  const b2Hash = generateSHA256(`2${new Date('2026-05-20T08:32:00Z').toISOString()}${r2.id}${fileHash2}${block1.hash}`);
  const block2 = await prisma.blockchainBlock.create({
    data: {
      index: 2,
      timestamp: new Date('2026-05-20T08:32:00Z'),
      recordId: r2.id,
      fileHash: fileHash2,
      action: 'UPLOAD',
      uploadedBy: patientJane.id,
      previousHash: block1.hash,
      hash: b2Hash,
      nonce: 87,
    },
  });

  await prisma.medicalRecord.update({
    where: { id: r2.id },
    data: { txId: block2.hash },
  });

  await prisma.auditLog.create({
    data: {
      userId: patientJane.id,
      action: 'RECORD_UPLOAD',
      details: 'Uploaded file chest_xray_smith.png. Mined in Block 2.',
      createdAt: new Date('2026-05-20T08:30:00Z'),
    },
  });

  // Report 3: A FLAG-TRIGGERED Record (Hash mismatch representation)
  const tamperedOcr = `
=========================================
DISCHARGE SUMMARY
Patient: Emily Watson
IP No: IP-992384        Ref: Dr. Gregory House
Surgical Procedure: Laparoscopic Cholecystectomy
Claim amount billed: $85,000
=========================================
  `;

  // Stored file hash representing the original file upload
  const originalFileHash = generateSHA256(tamperedOcr);
  
  // We mock a modified file state where someone edited the values in DB later to change the file name / URL
  const r3 = await prisma.medicalRecord.create({
    data: {
      patientId: patientEmily.id,
      uploadedById: patientEmily.id,
      fileName: 'discharge_summary_watson.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://supabase.co/storage/v1/object/public/medical-records/discharge_summary_watson.pdf',
      fileSize: 94800,
      blockchainHash: 'wrong-altered-hash-to-trigger-blockchain-error-alert', // Simulating tampering
      ocrText: tamperedOcr,
      aiSummary: JSON.stringify({
        patientName: 'Emily Watson',
        date: '2026-05-07',
        reportType: 'Hospital Discharge Summary',
        keyFindings: ['Laparoscopic Cholecystectomy successfully performed.'],
        abnormalities: ['Pre-operative acute Calculus Cholecystitis.'],
        recommendations: ['Low-fat recovery diet.'],
        summary: 'Patient underwent cholecystectomy for gallstones. Vitals are stable, discharged.',
      }),
      recordType: 'Hospital Discharge Summary',
      verificationStatus: VerificationStatus.FLAGGED,
      fraudScore: 95.0,
      createdAt: new Date('2026-05-07T11:15:00Z'),
    },
  });

  // Block 3 matching the original upload (so checking it will result in Mismatched Hash)
  const b3Hash = generateSHA256(`3${new Date('2026-05-07T11:18:00Z').toISOString()}${r3.id}${originalFileHash}${block2.hash}`);
  const block3 = await prisma.blockchainBlock.create({
    data: {
      index: 3,
      timestamp: new Date('2026-05-07T11:18:00Z'),
      recordId: r3.id,
      fileHash: originalFileHash, // Block has the original hash
      action: 'UPLOAD',
      uploadedBy: patientEmily.id,
      previousHash: block2.hash,
      hash: b3Hash,
      nonce: 203,
    },
  });

  await prisma.medicalRecord.update({
    where: { id: r3.id },
    data: { txId: block3.hash },
  });

  console.log('Seeding Insurance claims...');
  
  // Seed corresponding insurance claims
  await prisma.insuranceClaim.create({
    data: {
      patientId: patientJohn.id,
      recordId: r1.id,
      claimAmount: 1850.0,
      fraudScore: 5.0,
      verificationStatus: ClaimStatus.APPROVED,
      policyNumber: 'POL-394802',
      insurerName: 'MediShield Inc',
      notes: 'Blood test diagnostic fee. Verified matching ledger records.',
      createdAt: new Date('2026-05-15T10:15:00Z'),
    },
  });

  await prisma.insuranceClaim.create({
    data: {
      patientId: patientJane.id,
      recordId: r2.id,
      claimAmount: 4320.0,
      fraudScore: 12.0,
      verificationStatus: ClaimStatus.PENDING,
      policyNumber: 'POL-109403',
      insurerName: 'Aetna-Care',
      createdAt: new Date('2026-05-20T08:45:00Z'),
    },
  });

  await prisma.insuranceClaim.create({
    data: {
      patientId: patientEmily.id,
      recordId: r3.id,
      claimAmount: 85000.0, // High outlier claim
      fraudScore: 95.0,
      verificationStatus: ClaimStatus.FLAGGED,
      policyNumber: 'POL-772983',
      insurerName: 'BlueCross Shield',
      notes: 'Payout halted. Cryptographic hash verification failed. Discrepancy detected between blockchain transaction logs and database entries.',
      createdAt: new Date('2026-05-07T11:30:00Z'),
    },
  });

  console.log('Database Seeding Completed Successfully! 🚀');
}

main()
  .catch((e) => {
    console.error('Seeding script encountered an error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
