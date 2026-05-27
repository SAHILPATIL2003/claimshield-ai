// ============================================================================
// ClaimShield AI - Firebase Admin Initialization (with demo mode bypass)
// ============================================================================

import * as admin from 'firebase-admin';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

let firebaseApp: admin.app.App | null = null;

if (!DEMO_MODE) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized with discrete environment variables.');
    } else {
      console.warn('Firebase configuration missing. Falling back to DEMO_MODE = true.');
      process.env.DEMO_MODE = 'true';
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    console.warn('Falling back to DEMO_MODE = true.');
    process.env.DEMO_MODE = 'true';
  }
} else {
  console.log('Firebase Admin runs in DEMO_MODE. Verification will bypass real Firebase server.');
}

export const getFirebaseAdmin = () => {
  return admin;
};

export default firebaseApp;
