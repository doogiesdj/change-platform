export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentIntentResult {
  paymentIntentId: string;
  checkoutUrl?: string;
  clientSecret?: string;
  expiresAt?: Date;
}

export interface PaymentConfirmResult {
  success: boolean;
  transactionId?: string;
  paidAt?: Date;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  refundedAt?: Date;
  errorMessage?: string;
}

export interface WebhookParseResult {
  eventId: string;
  eventType: string;
  paymentIntentId: string;
  status: 'paid' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
  errorMessage?: string;
}

export interface CreatePaymentIntentParams {
  donationId: string;
  amount: number;
  currency: string;
  orderId: string;
  orderName: string;
  metadata?: Record<string, unknown>;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentKey?: string;
  amount: number;
}

export interface RefundParams {
  paymentIntentId: string;
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface IPaymentProvider {
  readonly providerName: string;

  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;

  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentConfirmResult>;

  refund(params: RefundParams): Promise<RefundResult>;

  verifyAndParseWebhook(rawBody: Buffer, signature: string): Promise<WebhookParseResult>;
}

export interface ISubscriptionProvider {
  createSubscription(params: {
    donationId: string;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
    billingKey: string;
  }): Promise<{ subscriptionId: string }>;

  cancelSubscription(subscriptionId: string): Promise<{ success: boolean }>;
}
