// ============================================================================
// ClaimShield AI - API Communication Service Client
// ============================================================================

import { useAppStore } from './store';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

/**
 * Custom fetch client that injects authorization token header.
 */
async function fetchClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = useAppStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (err) {
    return {
      success: false,
      error: `Server responded with invalid JSON: ${response.statusText}`,
    };
  }

  if (!response.ok) {
    // Session expiration trigger
    if (response.status === 401) {
      useAppStore.getState().logout();
    }
    return {
      success: false,
      message: result.message || 'An error occurred during request.',
      error: result.error || 'Server Error',
    };
  }

  return result;
}

export const api = {
  // Auth operations
  verifyOtp: (firebaseToken: string) => 
    fetchClient('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ firebaseToken }),
    }),

  demoLogin: (mobileNumber: string, role: string, fullName: string) =>
    fetchClient('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, role, fullName }),
    }),

  setRole: (role: string, fullName: string, hospitalId?: string) =>
    fetchClient('/auth/set-role', {
      method: 'POST',
      body: JSON.stringify({ role, fullName, hospitalId }),
    }),

  getMe: () => fetchClient('/auth/me'),

  getPublicHospitals: () => fetchClient('/public/hospitals'),

  // Records operations
  uploadRecord: (file: File) => {
    const formData = new FormData();
    formData.append('medicalFile', file);
    return fetchClient('/records/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getMyRecords: () => fetchClient('/records/my'),
  
  getTimeline: () => fetchClient('/records/timeline'),

  verifyRecord: (recordId: string) => fetchClient(`/records/verify/${recordId}`),

  // Public (QR) verification endpoint - no JWT required
  verifyRecordPublic: (recordId: string) => fetchClient(`/records/public/verify/${recordId}`),

  getQRCode: (recordId: string) => fetchClient(`/records/qr/${recordId}`),

  getRecordById: (recordId: string) => fetchClient(`/records/${recordId}`),

  // Doctor/Staff operations
  searchPatients: (query: string) => fetchClient(`/patients?query=${encodeURIComponent(query)}`),

  getPatientRecords: (patientId: string) => fetchClient(`/patients/${patientId}/records`),

  addDoctorNote: (recordId: string, note: string) =>
    fetchClient('/patients/notes', {
      method: 'POST',
      body: JSON.stringify({ recordId, note }),
    }),

  // Admin Dashboard operations
  getAnalytics: () => fetchClient('/admin/analytics'),

  getUsers: () => fetchClient('/admin/users'),

  updateUser: (userId: string, data: { fullName: string; role: string; isActive: boolean; hospitalId?: string | null }) =>
    fetchClient(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteUser: (userId: string) =>
    fetchClient(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),

  getFraudData: () => fetchClient('/admin/fraud'),

  getBlockchainLedger: () => fetchClient('/admin/blockchain'),

  getAuditLogs: () => fetchClient('/admin/logs'),

  getClaims: () => fetchClient('/admin/claims'),

  updateClaim: (claimId: string, status: string, notes: string) =>
    fetchClient(`/admin/claims/${claimId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  deleteRecord: (recordId: string) =>
    fetchClient(`/admin/records/${recordId}`, {
      method: 'DELETE',
    }),

  getHospitals: () => fetchClient('/admin/hospitals'),

  createHospital: (data: { name: string; address?: string; phone?: string; email?: string; adminId?: string | null }) =>
    fetchClient('/admin/hospitals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
