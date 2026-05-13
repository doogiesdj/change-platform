import { apiClient } from './client';

export interface DashboardOverview {
  totalUsers: number;
  totalPetitions: number;
  publishedPetitions: number;
  pendingReviewPetitions: number;
  totalSignatures: number;
  totalDonationAmount: number;
}

export interface DashboardSignatures {
  byRegion: { region: string; count: number }[];
  byAgeBand: { ageBand: string; count: number }[];
  byGender: { gender: string; count: number }[];
}

export interface DashboardDonations {
  totalAmount: number;
  recentTotal: number;
  byTargetType: {
    targetType: 'petition' | 'platform';
    amount: number;
    count: number;
  }[];
}

export interface DashboardPetitions {
  byStatus: { status: string; count: number }[];
  byCategory: { categoryCode: string; count: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminUserList {
  data: AdminUser[];
  total: number;
}

export interface ReviewQueueItem {
  id: string;
  petitionId: string;
  reviewStatus: string;
  createdAt: string;
  reviewedAt: string | null;
  petition: { id: string; title: string; status: string; createdAt: string };
  latestClassificationResult: {
    primaryCategoryCode: string;
    confidence: number;
    rawReasoningSummary: string | null;
  } | null;
  assignedModerator: { id: string; displayName: string | null } | null;
  reviewedBy: { id: string; displayName: string | null } | null;
}

export interface DecideReviewDto {
  decision: 'approve' | 'reject' | 'reclassify';
  note?: string;
  newCategoryCode?: string;
}

export interface AuditLog {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string | null;
  beforeJson: Record<string, unknown> | null;
  afterJson: Record<string, unknown> | null;
  metadataJson: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; displayName: string | null };
}

export const adminApi = {
  getDashboardOverview: () =>
    apiClient.get<DashboardOverview>('/admin/dashboard/overview'),
  getDashboardSignatures: () =>
    apiClient.get<DashboardSignatures>('/admin/dashboard/signatures'),
  getDashboardDonations: () =>
    apiClient.get<DashboardDonations>('/admin/dashboard/donations'),
  getDashboardPetitions: () =>
    apiClient.get<DashboardPetitions>('/admin/dashboard/petitions'),
  getUsers: (page = 1, limit = 20, search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    return apiClient.get<AdminUserList>(`/admin/users?${params}`);
  },
  updateUserRole: (id: string, role: string) =>
    apiClient.patch<{ id: string; email: string; role: string }>(
      `/admin/users/${id}/role`,
      { role },
    ),
  updateUserStatus: (id: string, status: 'active' | 'suspended' | 'deleted') =>
    apiClient.patch<{ id: string; email: string; role: string; status: string }>(
      `/admin/users/${id}/status`,
      { status },
    ),
  getReviewQueue: (status?: string) =>
    apiClient.get<ReviewQueueItem[]>(`/admin/review-queue${status ? `?status=${status}` : ''}`),
  assignReview: (id: string) =>
    apiClient.patch<ReviewQueueItem>(`/admin/review-queue/${id}/assign`, {}),
  decideReview: (id: string, dto: DecideReviewDto) =>
    apiClient.patch<ReviewQueueItem>(`/admin/review-queue/${id}/decide`, dto),
  getAuditLogs: (page = 1, limit = 50) =>
    apiClient.get<AuditLog[]>(`/admin/audit-logs?page=${page}&limit=${limit}`),
  deleteFromQueue: (reviewId: string) =>
    apiClient.delete<{ id: string; petitionId: string; deleted: boolean }>(`/admin/review-queue/${reviewId}`),
  deletePetition: (id: string) =>
    apiClient.delete<{ id: string }>(`/petitions/${id}`),
};
