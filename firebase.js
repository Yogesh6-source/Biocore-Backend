import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Placeholder for Firebase Admin initialization
// In production, use a service account key
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

try {
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Or use cert(serviceAccount)
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin Initialized');
  } else {
    console.warn('FIREBASE_PROJECT_ID not set, skipping Firebase Admin initialization');
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminStorage = admin.apps.length > 0 ? admin.storage() : null;
