import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const verifyToken = randomUUID();

    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        verifyToken,
        emailVerified: false,
      },
    });

    // Send verification email (don't block on failure)
    this.mail.sendVerification(dto.email, verifyToken).catch((err) => {
      console.error('Failed to send verification email:', err.message);
    });

    return { message: 'Письмо с подтверждением отправлено на ' + dto.email };
  }

  async verify(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verifyToken: token },
    });
    if (!user) throw new BadRequestException('Неверная или просроченная ссылка');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Пользователь не найден');
    if (user.emailVerified) throw new BadRequestException('Email уже подтверждён');

    const verifyToken = randomUUID();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    await this.mail.sendVerification(email, verifyToken);
    return { message: 'Письмо отправлено повторно' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
