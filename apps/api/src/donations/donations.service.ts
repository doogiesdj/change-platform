import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IPaymentProvider, PAYMENT_PROVIDER } from '../payments/payment-provider.interface';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private paymentProvider: IPaymentProvider,
  ) {}

  async createIntent(dto: CreatePaymentIntentDto, userId: string) {
    if (dto.targetType === 'petition') {
      if (!dto.petitionId) {
        throw new BadRequestException('petition 후원 시 petitionId가 필요합니다.');
      }
      const petition = await this.prisma.petition.findUnique({ where: { id: dto.petitionId } });
      if (!petition) throw new NotFoundException('청원을 찾을 수 없습니다.');
    } else if (dto.targetType === 'platform' && dto.petitionId) {
      throw new BadRequestException('플랫폼 후원에는 petitionId를 지정할 수 없습니다.');
    }

    const idempotencyKey = dto.idempotencyKey ?? randomUUID();
    const currency = dto.currency ?? 'KRW';

    const existing = await this.prisma.donation.findUnique({ where: { idempotencyKey } });
    if (existing) {
      throw new ConflictException('동일한 idempotencyKey로 이미 후원이 생성되었습니다.');
    }

    const orderId = `order_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const orderName =
      dto.targetType === 'petition'
        ? `청원 후원 ${dto.amount.toLocaleString()}원`
        : `플랫폼 후원 ${dto.amount.toLocaleString()}원`;

    const intentResult = await this.paymentProvider.createPaymentIntent({
      donationId: orderId,
      amount: dto.amount,
      currency,
      orderId,
      orderName,
    });

    const donation = await this.prisma.donation.create({
      data: {
        donorUserId: userId,
        targetType: dto.targetType,
        petitionId: dto.petitionId ?? null,
        donationType: dto.donationType,
        amount: dto.amount,
        currency,
        provider: this.paymentProvider.providerName,
        status: 'pending',
        donorName: dto.donorName ?? null,
        message: dto.message ?? null,
        idempotencyKey,
        paymentIntentId: intentResult.paymentIntentId,
      },
    });

    return {
      donationId: donation.id,
      paymentIntentId: intentResult.paymentIntentId,
      checkoutUrl: intentResult.checkoutUrl,
      clientSecret: intentResult.clientSecret,
      expiresAt: intentResult.expiresAt,
      amount: dto.amount,
      currency,
    };
  }

  async confirmPayment(donationId: string, dto: ConfirmPaymentDto, userId: string) {
    const donation = await this.prisma.donation.findUnique({ where: { id: donationId } });

    if (!donation) throw new NotFoundException('후원을 찾을 수 없습니다.');
    if (donation.donorUserId !== userId) throw new BadRequestException('본인의 후원만 확인할 수 있습니다.');
    if (donation.status === 'paid') throw new ConflictException('이미 결제 완료된 후원입니다.');
    if (donation.status === 'failed' || donation.status === 'cancelled') {
      throw new BadRequestException(`결제를 진행할 수 없는 상태입니다: ${donation.status}`);
    }
    if (!donation.paymentIntentId) throw new BadRequestException('paymentIntentId가 없습니다.');
    if (dto.amount !== donation.amount) {
      throw new BadRequestException('결제 금액이 후원 금액과 일치하지 않습니다.');
    }

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: 'processing' },
    });

    const result = await this.paymentProvider.confirmPayment({
      paymentIntentId: donation.paymentIntentId,
      paymentKey: dto.paymentKey,
      amount: donation.amount,
    });

    await this.prisma.paymentAttempt.create({
      data: {
        donationId: donation.id,
        provider: this.paymentProvider.providerName,
        providerTransactionId: result.transactionId ?? null,
        requestPayloadJson: { paymentIntentId: donation.paymentIntentId, amount: donation.amount },
        responsePayloadJson: {
          success: result.success,
          transactionId: result.transactionId ?? null,
          errorMessage: result.errorMessage ?? null,
        },
        status: result.success ? 'success' : 'failed',
        attemptedAt: new Date(),
      },
    });

    if (!result.success) {
      await this.prisma.donation.update({
        where: { id: donationId },
        data: { status: 'failed' },
      });
      throw new BadRequestException(result.errorMessage ?? '결제에 실패했습니다.');
    }

    const paidDonation = await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: 'paid', paidAt: result.paidAt ?? new Date() },
      select: {
        id: true,
        targetType: true,
        petitionId: true,
        donationType: true,
        amount: true,
        currency: true,
        provider: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    if (donation.targetType === 'petition' && donation.petitionId) {
      await this.prisma.petition.update({
        where: { id: donation.petitionId },
        data: { donationAmountCached: { increment: donation.amount } },
      });
    }

    return paidDonation;
  }

  findByUser(userId: string, take = 50) {
    return this.prisma.donation.findMany({
      where: { donorUserId: userId },
      select: {
        id: true,
        targetType: true,
        petitionId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async getDonationStats(petitionId: string) {
    const result = await this.prisma.donation.aggregate({
      where: { petitionId, targetType: 'petition', status: 'paid' },
      _sum: { amount: true },
      _count: { _all: true },
      _avg: { amount: true },
    });

    return {
      totalAmount: result._sum.amount ?? 0,
      donationCount: result._count._all,
      averageAmount: Math.round(result._avg.amount ?? 0),
      currency: 'KRW',
    };
  }
}
