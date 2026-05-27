// ============================================================================
// ClaimShield AI - Cryptographic Hashing and Verification Helpers
// ============================================================================

import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

/**
 * Generates a SHA-256 hash of a file buffer
 */
export const generateSHA256 = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * Generates a QR code data URL (Base64) for verification
 * @param verificationUrl The URL that the QR code will scan to (redirects to report viewer)
 */
export const generateVerificationQRCode = async (verificationUrl: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff', // white
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate verification QR code:', error);
    throw new Error('QR code generation failed');
  }
};
