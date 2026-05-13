import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: '테스트유저',
  passwordHash: 'hashed_pw',
  role: 'user' as const,
  status: 'active' as const,
  avatarUrl: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null as Date | null,
  passwordResetToken: null as string | null,
  passwordResetExpiry: null as Date | null,
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock_token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('creates a user and returns token when email is not taken', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed_pw');
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: '테스트유저',
      });

      expect(result.accessToken).toBe('mock_token');
      expect(result.email).toBe('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', passwordHash: 'hashed_pw' }),
      );
    });

    it('throws ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: 'pw', displayName: 'name' }),
      ).rejects.toThrow(ConflictException);
    });

    it('hashes password with cost factor 12', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed');
      usersService.create.mockResolvedValue(mockUser);

      await service.register({ email: 'a@b.com', password: 'plain', displayName: 'test' });

      expect(bcryptMock.hash).toHaveBeenCalledWith('plain', 12);
    });
  });

  describe('login', () => {
    it('returns token when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result.accessToken).toBe('mock_token');
      expect(result.id).toBe('user-1');
    });

    it('throws UnauthorizedException when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noone@example.com', password: 'pw' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns user without passwordHash', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('user-1');
    });

    it('throws NotFoundException when user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getMe('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('signToken', () => {
    it('includes role in JWT payload', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed');
      usersService.create.mockResolvedValue(mockUser);

      await service.register({ email: 'a@b.com', password: 'pw', displayName: 'name' });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user', email: 'test@example.com' }),
      );
    });
  });
});
