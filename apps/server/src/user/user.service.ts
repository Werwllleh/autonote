import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        expenseRemindersEnabled: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateEmail(userId: string, dto: UpdateEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Неверный пароль');

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Email уже используется');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email },
      select: { id: true, email: true, name: true, avatar: true },
    });
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Неверный пароль');

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });

    return { message: 'Пароль изменён' };
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: { expenseRemindersEnabled: dto.expenseRemindersEnabled },
      select: { id: true, email: true, name: true, avatar: true, expenseRemindersEnabled: true },
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.avatar) {
      await this.uploadService.removeImage(user.avatar);
    }

    const url = await this.uploadService.processImage(file, 'avatars', 256);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: { id: true, email: true, name: true, avatar: true },
    });
  }

  async removeAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.avatar) {
      await this.uploadService.removeImage(user.avatar);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { id: true, email: true, name: true, avatar: true },
    });
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vehicles: { select: { photo: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Неверный пароль');

    // Delete uploaded files: avatar + vehicle photos
    const filesToDelete: string[] = [];
    if (user.avatar) filesToDelete.push(user.avatar);
    for (const v of user.vehicles) {
      if (v.photo) filesToDelete.push(v.photo);
    }
    await Promise.all(
      filesToDelete.map((url) => this.uploadService.removeImage(url)),
    );

    // Cascade deletes vehicles, expenses, parts, categories, service intervals
    await this.prisma.user.delete({ where: { id: userId } });

    return { deleted: true };
  }
}
