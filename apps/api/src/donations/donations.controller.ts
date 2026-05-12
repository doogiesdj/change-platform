import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Post('intent')
  createIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.donationsService.createIntent(dto, user.id);
  }

  @Post('confirm/:id')
  confirmPayment(
    @Param('id') donationId: string,
    @Body() dto: ConfirmPaymentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.donationsService.confirmPayment(donationId, dto, user.id);
  }

  @Get('me')
  findMyDonations(@CurrentUser() user: CurrentUserPayload) {
    return this.donationsService.findByUser(user.id);
  }
}
