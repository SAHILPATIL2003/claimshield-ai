// ============================================================================
// ClaimShield AI - Next.js Root Layout configuration
// ============================================================================

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClaimShield AI - Healthcare Blockchain Records & Insurance Audits',
  description: 'SaaS platform securing medical records using cryptographically anchored SHA-256 ledger blocks to eliminate insurance double-claim fraud.',
  keywords: ['healthcare blockchain', 'insurance fraud protection', 'medical ledger', 'SHA-256 record audit', 'Tesseract OCR medical summary'],
  authors: [{ name: 'ClaimShield Development Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className="antialiased selection:bg-teal-500/35 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
