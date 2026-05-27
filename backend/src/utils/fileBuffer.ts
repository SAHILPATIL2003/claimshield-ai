import * as fs from 'fs';
import * as path from 'path';
import { generateSHA256 } from './hash';

export const hashFromFileUrl = async (fileUrl: string): Promise<string> => {
  const uploadsMatch = fileUrl.match(/\/uploads\/([^/?#]+)$/);
  if (uploadsMatch) {
    const localPath = path.join(__dirname, '../../uploads', uploadsMatch[1]);
    if (fs.existsSync(localPath)) {
      return generateSHA256(fs.readFileSync(localPath));
    }
  }

  const controller = new AbortController();
  const timeoutMs = Number(process.env.VERIFY_FETCH_TIMEOUT_MS || 20000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(fileUrl, { signal: controller.signal });
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    return generateSHA256(Buffer.from(await resp.arrayBuffer()));
  } finally {
    clearTimeout(timeout);
  }
};
