import { Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('payments')
  @HttpCode(200)
  async handlePaymentWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('toss-signature') tossSignature: string,
    @Headers('x-webhook-signature') genericSignature: string,
  ): Promise<{ ok: boolean }> {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    const signature = tossSignature ?? genericSignature ?? '';

    await this.webhookService.handleWebhook(rawBody, signature);
    return { ok: true };
  }
}
