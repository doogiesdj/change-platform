# Payment Provider Abstraction

## Overview

The payment system uses a provider abstraction to support multiple payment gateways (PGs) while keeping business logic independent of any specific PG SDK.

Provider is selected at server startup via `PAYMENT_PROVIDER` env var — the client never controls this.

## Architecture

```
POST /donations/intent   →  DonationsService.createIntent()
                             → IPaymentProvider.createPaymentIntent()
                             → returns { donationId, checkoutUrl, paymentIntentId }

User completes payment on PG checkout page

POST /donations/confirm/:id  →  DonationsService.confirmPayment()
                                 → IPaymentProvider.confirmPayment()
                                 → updates Donation to paid/failed

POST /webhooks/payments   →  WebhookController
                              → WebhookService.handleWebhook()
                              → IPaymentProvider.verifyAndParseWebhook()
                              → updates Donation from webhook event (idempotent)
```

## IPaymentProvider Interface

```typescript
interface IPaymentProvider {
  readonly providerName: string;

  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  confirmPayment(params: ConfirmPaymentParams): Promise<PaymentConfirmResult>;
  refund(params: RefundParams): Promise<RefundResult>;
  verifyAndParseWebhook(rawBody: Buffer, signature: string): Promise<WebhookParseResult>;
}
```

## Providers

| Provider | File | When Used |
|----------|------|-----------|
| `MockPaymentProvider` | `payments/providers/mock-payment.provider.ts` | `PAYMENT_PROVIDER=mock` (local dev) |
| `TossPaymentsProvider` | `payments/providers/toss-payments.provider.ts` | `PAYMENT_PROVIDER=toss` (production) |

## Donation Status Transitions

```
pending
  └─→ processing   (confirmPayment called)
        ├─→ paid       (PG confirms success)
        └─→ failed     (PG returns failure)

pending
  └─→ cancelled    (user cancels before confirming)

paid
  └─→ refunded     (refund processed via webhook)
```

## Webhook Idempotency

`WebhookEvent` table stores `(provider, eventId)` with a unique constraint. Before processing any webhook, the service checks if the event was already handled. This prevents double-application of webhook callbacks on PG retry.

## Security

- Webhook signature is verified via HMAC-SHA256 before any payload is parsed.
- `TOSS_WEBHOOK_SECRET` must be set in production and rotated if exposed.
- `provider` is never accepted from the client — it is always determined server-side from `PAYMENT_PROVIDER`.
- `idempotencyKey` on `Donation` prevents duplicate charges from network retries.

## Adding a New Provider

1. Implement `IPaymentProvider` in `payments/providers/<name>.provider.ts`
2. Add the provider to `payments.module.ts` factory
3. Add required env vars to `.env.example`
4. Update this document

## Pre-PG Connection Checklist

Before switching `PAYMENT_PROVIDER=toss` in production:

- [ ] `TOSS_SECRET_KEY` set and not committed to git
- [ ] `TOSS_WEBHOOK_SECRET` set and not committed to git
- [ ] `TOSS_CLIENT_KEY` set for frontend SDK
- [ ] `TOSS_SUCCESS_URL` and `TOSS_FAIL_URL` point to production domain
- [ ] Webhook endpoint `POST /webhooks/payments` publicly reachable
- [ ] Webhook endpoint registered in Toss developer console
- [ ] `WebhookEvent` table migrated (`prisma migrate deploy`)
- [ ] `Donation.idempotencyKey` unique index migrated
- [ ] Duplicate webhook delivery tested (send same eventId twice, confirm idempotency)
- [ ] Refund flow tested end-to-end in Toss sandbox
