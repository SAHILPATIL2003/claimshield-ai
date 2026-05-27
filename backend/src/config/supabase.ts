// ============================================================================
// ClaimShield AI - Supabase Client Config & File Storage Utility
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'medical-records';
const DEMO_MODE = process.env.DEMO_MODE === 'true' || !SUPABASE_URL || (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY);

let supabase: any = null;

if (!DEMO_MODE) {
  try {
    // Prefer service role for backend uploads (enterprise-grade + safer).
    const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    supabase = createClient(SUPABASE_URL, keyToUse);
    console.log('Supabase Client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    console.warn('Falling back to local storage simulation.');
  }
} else {
  console.log('Supabase runs in DEMO_MODE or lacks keys. Storing files locally in backend/uploads.');
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

/**
 * Uploads a file to Supabase storage, or saves it locally in demo/fallback mode.
 * Returns the public URL of the uploaded file.
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  const fileExt = path.extname(fileName);
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;

  if (!DEMO_MODE && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueFileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Supabase storage upload failed, falling back to local file:', error);
    }
  }

  // Local storage simulation fallback
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, uniqueFileName);
  fs.writeFileSync(filePath, fileBuffer);

  // Return a mock URL path or server asset URL path
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/${uniqueFileName}`;
};

export default supabase;
