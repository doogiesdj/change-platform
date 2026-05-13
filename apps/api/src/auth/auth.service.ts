import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import type { UserRole } from '@change/shared';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');

    return this.signToken(user);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always return success to avoid email enumeration
    if (!user || user.status !== 'active') {
      return { message: '이메일이 발송되었습니다.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(user.email, resetUrl);

    return { message: '이메일이 발송되었습니다.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
        status: 'active',
      },
    });

    if (!user) throw new BadRequestException('유효하지 않거나 만료된 토큰입니다.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });

    return { message: '비밀번호가 재설정되었습니다.' };
  }

  private signToken(user: { id: string; email: string; displayName: string; role: UserRole }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
