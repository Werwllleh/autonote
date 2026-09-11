import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: { findUnique: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadService, useValue: {} },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('getProfile', () => {
    it('includes expenseRemindersEnabled in the selected fields', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u1@test.com',
        name: null,
        avatar: null,
        createdAt: new Date(),
        expenseRemindersEnabled: false,
      });

      const result = await service.getProfile('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ expenseRemindersEnabled: true }),
        }),
      );
      expect(result.expenseRemindersEnabled).toBe(false);
    });
  });

  describe('updateNotificationSettings', () => {
    it('updates expenseRemindersEnabled for the given user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.user.update.mockResolvedValue({ id: 'u1', expenseRemindersEnabled: false });

      await service.updateNotificationSettings('u1', { expenseRemindersEnabled: false });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { expenseRemindersEnabled: false },
        select: expect.objectContaining({ expenseRemindersEnabled: true }),
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateNotificationSettings('missing', { expenseRemindersEnabled: true }),
      ).rejects.toThrow('User not found');
    });
  });
});
