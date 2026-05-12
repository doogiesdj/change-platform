import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfirmPaymentParams,
  CreatePaymentIntentParams,
  IPaymentProvider,
  ISubscriptionProvider,
  PaymentConfirmResult,
  PaymentIntentResult,
  RefundParams,
  RefundResult,
  WebhookParseResult,
} from '../payment-provider.interface';

// Toss Payments API docs: https://docs.tosspayments.com/reference
// Webhook event types: https://docs.tosspayments.com/reference/webhooks
// Signature verification: HMAC-SHA256 of raw body with secret key

interface TossWebhookPayload {
  eventType: string;
  createdAt: string;
  data: {
    paymentKey: string;
    orderId: string;
    orderName: string;
    status: string;
    totalAmount: number;
    approvedAt?: string;
    failureCode?: string;
    failureMessage?: string;
  };
}

@Injectable()
export class TossPaymentsProvider implements IPaymentProvider, ISubscriptionProvider {
  readonly providerName = 'toss';
  private readonly logger = new Logger(TossPaymentsProvider.name);
  private readonly baseUrl = 'https://api.tosspayments.com/v1';
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(private readonly config: ConfigService) {
    this.secretKey = config.getOrThrow<string>('TOSS_SECRET_KEY');
    this.webhookSecret = config.getOrThrow<string>('TOSS_WEBHOOK_SECRET');
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const clientKey = this.config.getOrThrow<string>('TOSS_CLIENT_KEY');
    const successUrl = this.config.getOrThrow<string>('TOSS_SUCCESS_URL');
    const failUrl = this.config.getOrThrow<string>('TOSS_FAIL_URL');

    // Toss uses client-side SDK to render the payment widget.
    // createPaymentIntent returns the data the frontend needs to call toss.requestPayment().
    return {
      paymentIntentId: params.orderId,
      clientSecret: clientKey,
      checkoutUrl: `${successUrl}?orderId=${params.orderId}&amount=${params.amount}`,
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentConfirmResult> {
    if (!params.paymentKey) {
      return { success: false, errorMessage: 'paymentKey required for Toss confirmation' };
    }

    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');

    const response = await fetch(`${this.baseUrl}/payments/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey: params.paymentKey,
        orderId: params.paymentIntentId,
        amount: params.amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string; code?: string };
      this.logger.error('Toss confirm failed', error);
      return { success: false, errorMessage: error.message ?? 'Payment confirmation failed' };
    }

    const data = await response.json() as { paymentKey: string; approvedAt: string };

    return {
      success: true,
      transactionId: data.paymentKey,
      paidAt: new Date(data.approvedAt),
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    const encoded = Buffer.from(`${this.secretKey}:`).toString('base64');

    const body: Record<string, unknown> = {
      cancelReason: params.reason ?? '사용자 요청',
    };
    if (params.amount !== undefined) {
      body.cancelAmount = params.amount;
    }

    const response = await fetch(`${this.baseUrl}/payments/${params.transactionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      this.logger.error('Toss refund failed', error);
      return { success: false, errorMessage: error.message ?? 'Refund failed' };
    }

    const data = await response.json() as { cancels?: Array<{ transactionKey: string; canceledAt: string }> };
    const cancel = data.cancels?.[0];

    return {
      success: true,
      refundId: cancel?.transactionKey,
      refundedAt: cancel?.canceledAt ? new Date(cancel.canceledAt) : new Date(),
    };
  }

  async verifyAndParseWebhook(rawBody: Buffer, signature: string): Promise<WebhookParseResult> {
    await this.verifySignature(rawBody, signature);

    const payload = JSON.parse(rawBody.toString()) as TossWebhookPayload;
    const { data, eventType } = payload;

    const statusMap: Record<string, 'paid' | 'failed' | 'cancelled' | 'refunded'> = {
      DONE: 'paid',
      ABORTED: 'failed',
      EXPIRED: 'cancelled',
      CANCELED: 'refunded',
    };

    return {
      eventId: `${data.orderId}_${payload.createdAt}`,
      eventType,
      paymentIntentId: data.orderId,
      status: statusMap[data.status] ?? 'failed',
      transactionId: data.paymentKey,
      paidAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
      errorMessage: data.failureMessage,
    };
  }

  async createSubscription(params: {
    donationId: string;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
    billingKey: string;
  }): Promise<{ subscriptionId: string }> {
    // Toss billing key-based recurring: https://docs.tosspayments.com/reference/billing
    this.logger.log('Toss subscription creation is not yet implemented');
    throw new Error('Toss subscription not yet implemented');
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    this.logger.log('Toss subscription cancellation is not yet implemented');
    throw new Error('Toss subscription cancellation not yet implemented');
  }

  private async verifySignature(rawBody: Buffer, signature: string): Promise<void> {
    const { createHmac } = await import('node:crypto');
    const expected = createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      throw new Error('Invalid webhook signature');
    }
  }
}
