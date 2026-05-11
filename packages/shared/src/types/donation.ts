export type DonationTargetType = 'petition' | 'platform';
export type DonationType = 'one_time' | 'recurring';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BillingCycle = 'monthly' | 'yearly';

export interface Donation {
  id: string;
  donorUserId: string | null;
  targetType: DonationTargetType;
  petitionId: string | null;
  donationType: DonationType;
  amount: number;
  currency: string;
  provider: string;
  status: DonationStatus;
  donorName: string | null;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}
