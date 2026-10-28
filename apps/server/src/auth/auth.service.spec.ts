import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };
  let mailService: { sendVerification: jest.Mock; sendPasswordReset: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };
    mailService = {
      sendVerification: jest.fn(),
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('records lastLoginAt when credentials are valid and email is verified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        password: 'hashed',
        role: 'USER',
        emailVerified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ email: 'u1@test.com', password: 'plain' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('does not record lastLoginAt when the password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        password: 'hashed',
        role: 'USER',
        emailVerified: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'u1@test.com', password: 'wrong' }),
      ).rejects.toThrow();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('generates token and sends email if user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
      });
      prisma.user.update.mockResolvedValue({ id: 'u1' });

      const res = await service.forgotPassword({ email: 'U1@test.com' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'u1@test.com' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          resetPasswordToken: expect.any(String),
          resetPasswordExpires: expect.any(Date),
        },
      });
      expect(mailService.sendPasswordReset).toHaveBeenCalledWith(
        'u1@test.com',
        expect.any(String),
      );
      expect(res.message).toBeDefined();
    });

    it('returns generic message without sending email if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await service.forgotPassword({ email: 'unknown@test.com' });

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
      expect(res.message).toBeDefined();
    });
  });

  describe('validateResetToken', () => {
    it('returns valid: true when token is found and not expired', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        resetPasswordExpires: new Date(Date.now() + 10000),
      });

      const res = await service.validateResetToken('valid-token');
      expect(res).toEqual({ valid: true });
    });

    it('throws BadRequestException when token is expired or not found', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        resetPasswordExpires: new Date(Date.now() - 10000),
      });

      await expect(service.validateResetToken('expired-token')).rejects.toThrow(
        'Неверная или просроченная ссылка',
      );
    });
  });

  describe('resetPassword', () => {
    it('resets password, resets token and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        resetPasswordExpires: new Date(Date.now() + 10000),
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      prisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        role: 'USER',
      });

      const res = await service.resetPassword({
        token: 'valid-token',
        password: 'new-secret-password',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('new-secret-password', 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          password: 'new-hash',
          resetPasswordToken: null,
          resetPasswordExpires: null,
          emailVerified: true,
        },
      });
      expect(res.accessToken).toBe('token');
      expect(res.refreshToken).toBe('token');
    });

    it('throws if token is expired', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        resetPasswordExpires: new Date(Date.now() - 10000),
      });

      await expect(
        service.resetPassword({
          token: 'expired-token',
          password: 'new-secret-password',
        }),
      ).rejects.toThrow('Неверная или просроченная ссылка');
    });
  });
});
