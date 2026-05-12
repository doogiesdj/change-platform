import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IPaymentProvider, PAYMENT_PROVIDER } from './payment-provider.interface';
import { DonationStatus } from '@prisma/client';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: IPaymentProvider,
  ) {}

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const parsed = await this.provider.verifyAndParseWebhook(rawBody, signature);

    const existing = await this.prisma.webhookEvent.findUnique({
      where: { provider_eventId: { provider: this.provider.providerName, eventId: parsed.eventId } },
    });

    if (existing?.processed) {
      this.logger.log(`Webhook already processed: ${parsed.eventId}`);
      return;
    }

    const webhookEvent = await this.prisma.webhookEvent.upsert({
      where: { provider_eventId: { provider: this.provider.providerName, eventId: parsed.eventId } },
      create: {
        provider: this.provider.providerName,
        eventId: parsed.eventId,
        eventType: parsed.eventType,
        rawPayload: JSON.parse(rawBody.toString()),
      },
      update: {},
    });

    try {
      const donation = await this.prisma.donation.findFirst({
        where: { paymentIntentId: parsed.paymentIntentId },
      });

      if (!donation) {
        this.logger.warn(`No donation found for paymentIntentId: ${parsed.paymentIntentId}`);
        return;
      }

      const nextStatus = this.resolveStatus(parsed.status);

      await this.prisma.$transaction(async (tx) => {
        await tx.donation.update({
          where: { id: donation.id },
          data: {
            status: nextStatus,
            paidAt: parsed.status === 'paid' ? (parsed.paidAt ?? new Date()) : undefined,
            refundedAt: parsed.status === 'refunded' ? new Date() : undefined,
          },
        });

        await tx.paymentAttempt.create({
          data: {
            donationId: donation.id,
            provider: this.provider.providerName,
            providerTransactionId: parsed.transactionId,
            status: parsed.status === 'paid' ? 'success' : 'failed',
            responsePayloadJson: parsed as object,
          },
        });

        await tx.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { processed: true, processedAt: new Date() },
        });
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook processing failed: ${message}`, error);

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { error: message },
      });

      throw error;
    }
  }

  private resolveStatus(pgStatus: string): DonationStatus {
    switch (pgStatus) {
      case 'paid': return DonationStatus.paid;
      case 'failed': return DonationStatus.failed;
      case 'cancelled': return DonationStatus.cancelled;
      case 'refunded': return DonationStatus.refunded;
      default: return DonationStatus.failed;
    }
  }
}
