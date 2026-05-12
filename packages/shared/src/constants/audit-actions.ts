export const AUDIT_ACTION = {
  USER_ROLE_UPDATE: 'user_role_update',
  REVIEW_ASSIGN: 'review_assign',
  REVIEW_DECIDE: 'review_decide',
  PETITION_STATUS_CHANGE: 'petition_status_change',
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];
