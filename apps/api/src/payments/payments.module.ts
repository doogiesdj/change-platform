import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PAYMENT_PROVIDER } from './payment-provider.interface';
import { MockPaymentProvider } from './providers/mock-payment.provider';
import { TossPaymentsProvider } from './providers/toss-payments.provider';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  imports: [],
  controllers: [WebhookController],
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('PAYMENT_PROVIDER', 'mock');
        if (provider === 'toss') return new TossPaymentsProvider(config);
        return new MockPaymentProvider();
      },
      inject: [ConfigService],
    },
    WebhookService,
  ],
  exports: [PAYMENT_PROVIDER, WebhookService],
})
export class PaymentsModule {}
