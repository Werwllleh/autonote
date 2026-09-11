import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

jest.mock('bcrypt');

describe('AuthService.login', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token') },
        },
        { provide: ConfigService, useValue: { get: () => 'secret' } },
        { provide: MailService, useValue: { sendVerification: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

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
