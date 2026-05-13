import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } else {
      this.logger.warn('MAIL_USER/MAIL_PASS not set — emails will be logged to console only');
    }
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const subject = '[Change] 비밀번호 재설정';
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">비밀번호 재설정</h2>
        <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요.<br>링크는 1시간 후 만료됩니다.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
          비밀번호 재설정하기
        </a>
        <p style="color:#6b7280;font-size:13px;">
          이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
        </p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(`[비밀번호 재설정 링크] ${resetUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"Change 플랫폼" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      this.logger.log(`[비밀번호 재설정 링크 (fallback)] ${resetUrl}`);
    }
  }
}
