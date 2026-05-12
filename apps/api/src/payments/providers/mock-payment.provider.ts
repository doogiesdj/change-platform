import { Injectable } from '@nestjs/common';
import {
  ConfirmPaymentParams,
  CreatePaymentIntentParams,
  IPaymentProvider,
  PaymentConfirmResult,
  PaymentIntentResult,
  RefundParams,
  RefundResult,
  WebhookParseResult,
} from '../payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  readonly providerName = 'mock';

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    return {
      paymentIntentId: params.orderId,
      checkoutUrl: `http://localhost:3001/mock-checkout?orderId=${params.orderId}&amount=${params.amount}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
  }

  async confirmPayment(params: ConfirmPaymentParams): Promise<PaymentConfirmResult> {
    return {
      success: true,
      transactionId: `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      paidAt: new Date(),
    };
  }

  async refund(params: RefundParams): Promise<RefundResult> {
    return {
      success: true,
      refundId: `mock_refund_${Date.now()}`,
      refundedAt: new Date(),
    };
  }

  async verifyAndParseWebhook(rawBody: Buffer, signature: string): Promise<WebhookParseResult> {
    const payload = JSON.parse(rawBody.toString()) as {
      eventId: string;
      eventType: string;
      paymentIntentId: string;
      status: 'paid' | 'failed' | 'cancelled' | 'refunded';
    };

    return {
      eventId: payload.eventId ?? `mock_event_${Date.now()}`,
      eventType: payload.eventType ?? 'payment.completed',
      paymentIntentId: payload.paymentIntentId,
      status: payload.status ?? 'paid',
      paidAt: new Date(),
    };
  }
}
