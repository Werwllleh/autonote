import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private config: ConfigService) {
    this.from = config.get('MAIL_FROM') || 'noreply@auto-notes.ru';

    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT') || 465),
      secure: true,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async sendVerification(to: string, token: string) {
    const url = `https://my.auto-notes.ru/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `AutoNotes <${this.from}>`,
      to,
      subject: 'Подтвердите email — AutoNotes',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #18181b; border-radius: 12px; line-height: 48px; color: white; font-size: 20px;">🚗</div>
            <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">AutoNotes</h1>
          </div>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
            Спасибо за регистрацию! Нажмите кнопку ниже, чтобы подтверд��ть ваш email:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
              Подтвердить email
            </a>
          </div>
          <p style="color: #71717a; font-size: 13px; line-height: 1.5;">
            Если кнопка не работает, скопируйте ссылку:<br>
            <a href="${url}" style="color: #3b82f6; word-break: break-all;">${url}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">
            Если вы не регистрировались в AutoNotes, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    });
  }

  async sendVerificationReminder(to: string, token: string) {
    const url = `https://my.auto-notes.ru/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `AutoNotes <${this.from}>`,
      to,
      subject: 'Напоминание: подтвердите email — AutoNotes',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #18181b; border-radius: 12px; line-height: 48px; color: white; font-size: 20px;">🚗</div>
            <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">AutoNotes</h1>
          </div>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
            Вы ещё не подтвердили email. Без подтверждения часть возможностей AutoNotes недоступна — нажмите кнопку ниже:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
              Подтвердить email
            </a>
          </div>
          <p style="color: #71717a; font-size: 13px; line-height: 1.5;">
            Если кнопка не работает, скопируйте ссылку:<br>
            <a href="${url}" style="color: #3b82f6; word-break: break-all;">${url}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">
            Если вы не регистрировались в AutoNotes, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    });
  }

  async sendExpenseReminder(to: string) {
    const url = 'https://my.auto-notes.ru/expenses';

    await this.transporter.sendMail({
      from: `AutoNotes <${this.from}>`,
      to,
      subject: 'Давно не было новых расходов — AutoNotes',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: #18181b; border-radius: 12px; line-height: 48px; color: white; font-size: 20px;">🚗</div>
            <h1 style="margin: 16px 0 0; font-size: 24px; color: #18181b;">AutoNotes</h1>
          </div>
          <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
            Вы давно не добавляли расходы по своему автомобилю. Загляните в AutoNotes и внесите последние траты, чтобы история оставалась полной:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="display: inline-block; background: #18181b; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
              Добавить расход
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 12px;">
            Не хотите получать такие письма? Отключите их в настройках профиля — «Уведомления».
          </p>
        </div>
      `,
    });
  }
}
