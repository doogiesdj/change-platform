import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DonationsService } from './donations.service';
import { PrismaService } from '../database/prisma.service';
import { PAYMENT_PROVIDER } from '../payments/payment-provider.interface';

const mockDonation = {
  id: 'donation-1',
  donorUserId: 'user-1',
  targetType: 'petition',
  petitionId: 'petition-1',
  donationType: 'one_time',
  amount: 10000,
  currency: 'KRW',
  provider: 'mock',
  status: 'pending',
  donorName: null,
  message: null,
  idempotencyKey: 'idem-key-1',
  paymentIntentId: 'order-1',
  createdAt: new Date(),
  paidAt: null,
  refundedAt: null,
  refundReason: null,
  updatedAt: new Date(),
};

const buildPrismaMock = () => ({
  petition: { findUnique: jest.fn(), update: jest.fn() },
  donation: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  paymentAttempt: { create: jest.fn() },
});

describe('DonationsService', () => {
  let service: DonationsService;
  let prisma: ReturnType<typeof buildPrismaMock>;
  let paymentProvider: {
    providerName: string;
    createPaymentIntent: jest.Mock;
    confirmPayment: jest.Mock;
    refund: jest.Mock;
    verifyAndParseWebhook: jest.Mock;
  };

  beforeEach(async () => {
    prisma = buildPrismaMock();
    paymentProvider = {
      providerName: 'mock',
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn(),
      refund: jest.fn(),
      verifyAndParseWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PAYMENT_PROVIDER, useValue: paymentProvider },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
  });

  describe('createIntent', () => {
    const petitionDto = {
      targetType: 'petition' as const,
      petitionId: 'petition-1',
      donationType: 'one_time' as const,
      amount: 10000,
    };

    it('throws BadRequestException when petition targetType has no petitionId', async () => {
      await expect(
        service.createIntent(
          { targetType: 'petition' as const, donationType: 'one_time' as const, amount: 1000 },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when platform targetType has petitionId', async () => {
      await expect(
        service.createIntent(
          { targetType: 'platform' as const, petitionId: 'p-1', donationType: 'one_time' as const, amount: 1000 },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when petition does not exist', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createIntent(petitionDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when idempotencyKey already used', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue({ id: 'petition-1' });
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);

      await expect(
        service.createIntent({ ...petitionDto, idempotencyKey: 'idem-key-1' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('creates donation and returns intent data on success', async () => {
      (prisma.petition.findUnique as jest.Mock).mockResolvedValue({ id: 'petition-1' });
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(null);
      paymentProvider.createPaymentIntent.mockResolvedValue({
        paymentIntentId: 'order-1',
        checkoutUrl: 'http://localhost:3001/mock-checkout?orderId=order-1',
        expiresAt: new Date(Date.now() + 1800000),
      });
      (prisma.donation.create as jest.Mock).mockResolvedValue(mockDonation);

      const result = await service.createIntent(petitionDto, 'user-1');

      expect(paymentProvider.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 10000, currency: 'KRW' }),
      );
      expect(result).toMatchObject({
        donationId: 'donation-1',
        paymentIntentId: 'order-1',
        amount: 10000,
        currency: 'KRW',
      });
    });
  });

  describe('confirmPayment', () => {
    const confirmDto = { amount: 10000, paymentKey: 'pk_test_abc' };

    it('throws NotFoundException when donation does not exist', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.confirmPayment('donation-1', confirmDto, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws BadRequestException when userId does not match', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);

      await expect(service.confirmPayment('donation-1', confirmDto, 'user-2')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws ConflictException when donation already paid', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue({ ...mockDonation, status: 'paid' });

      await expect(service.confirmPayment('donation-1', confirmDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws BadRequestException when amount mismatch', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);

      await expect(
        service.confirmPayment('donation-1', { amount: 5000 }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('confirms payment, creates attempt, and returns paid donation', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);
      (prisma.donation.update as jest.Mock)
        .mockResolvedValueOnce({ ...mockDonation, status: 'processing' })
        .mockResolvedValueOnce({ ...mockDonation, status: 'paid', paidAt: new Date() });
      paymentProvider.confirmPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn-1',
        paidAt: new Date(),
      });
      (prisma.paymentAttempt.create as jest.Mock).mockResolvedValue({});
      (prisma.petition.update as jest.Mock).mockResolvedValue({});

      const result = await service.confirmPayment('donation-1', confirmDto, 'user-1');

      expect(prisma.donation.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'processing' } }),
      );
      expect(paymentProvider.confirmPayment).toHaveBeenCalledWith(
        expect.objectContaining({ paymentIntentId: 'order-1', amount: 10000 }),
      );
      expect(result.status).toBe('paid');
    });

    it('marks donation failed when payment provider returns failure', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);
      (prisma.donation.update as jest.Mock).mockResolvedValue({ ...mockDonation, status: 'failed' });
      paymentProvider.confirmPayment.mockResolvedValue({
        success: false,
        errorMessage: '카드 한도 초과',
      });
      (prisma.paymentAttempt.create as jest.Mock).mockResolvedValue({});

      await expect(service.confirmPayment('donation-1', confirmDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.donation.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'failed' } }),
      );
    });

    it('increments petition donationAmountCached on success', async () => {
      (prisma.donation.findUnique as jest.Mock).mockResolvedValue(mockDonation);
      (prisma.donation.update as jest.Mock)
        .mockResolvedValueOnce({ ...mockDonation, status: 'processing' })
        .mockResolvedValueOnce({ ...mockDonation, status: 'paid', paidAt: new Date() });
      paymentProvider.confirmPayment.mockResolvedValue({ success: true, transactionId: 'txn-1', paidAt: new Date() });
      (prisma.paymentAttempt.create as jest.Mock).mockResolvedValue({});
      (prisma.petition.update as jest.Mock).mockResolvedValue({});

      await service.confirmPayment('donation-1', confirmDto, 'user-1');

      expect(prisma.petition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { donationAmountCached: { increment: 10000 } },
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('queries donations by userId ordered by createdAt desc', async () => {
      (prisma.donation.findMany as jest.Mock).mockResolvedValue([]);

      await service.findByUser('user-1');

      expect(prisma.donation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { donorUserId: 'user-1' },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('getDonationStats', () => {
    it('returns aggregated stats for a petition', async () => {
      (prisma.donation.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 50000 },
        _count: { _all: 5 },
        _avg: { amount: 10000 },
      });

      const stats = await service.getDonationStats('petition-1');

      expect(stats.totalAmount).toBe(50000);
      expect(stats.donationCount).toBe(5);
      expect(stats.averageAmount).toBe(10000);
      expect(stats.currency).toBe('KRW');
    });

    it('returns zero stats when there are no donations', async () => {
      (prisma.donation.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null },
        _count: { _all: 0 },
        _avg: { amount: null },
      });

      const stats = await service.getDonationStats('petition-1');

      expect(stats.totalAmount).toBe(0);
      expect(stats.donationCount).toBe(0);
      expect(stats.averageAmount).toBe(0);
    });
  });
});
