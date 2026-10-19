import { Test } from '@nestjs/testing';
import { AssistantService } from './assistant.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseService } from '../expense/expense.service';
import { NotFoundException } from '@nestjs/common';

describe('AssistantService', () => {
  let service: AssistantService;
  let prisma: {
    vehicle: { findFirst: jest.Mock };
    category: { findMany: jest.Mock };
    expense: { findFirst: jest.Mock };
    assistantMessage: {
      findMany: jest.Mock;
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let expenseService: {
    create: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      vehicle: {
        findFirst: jest.fn(),
      },
      category: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'cat-fuel', slug: 'fuel', name: 'Топливо' },
          { id: 'cat-wash', slug: 'wash', name: 'Мойка' },
          { id: 'cat-other', slug: 'other', name: 'Прочее' },
        ]),
      },
      expense: {
        findFirst: jest.fn(),
      },
      assistantMessage: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    expenseService = {
      create: jest.fn(),
      remove: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AssistantService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExpenseService, useValue: expenseService },
      ],
    }).compile();

    service = module.get(AssistantService);
  });

  describe('getMessages', () => {
    it('throws NotFoundException if vehicle does not exist', async () => {
      prisma.vehicle.findFirst.mockResolvedValue(null);
      await expect(service.getMessages('user-1', 'v-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns messages in chronological order', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v-1', userId: 'user-1' });
      prisma.assistantMessage.findMany.mockResolvedValue([
        { id: '1', role: 'user', content: 'Привет' },
        { id: '2', role: 'model', content: 'Здорово!' },
      ]);

      const res = await service.getMessages('user-1', 'v-1');
      expect(res).toHaveLength(2);
      expect(prisma.assistantMessage.findMany).toHaveBeenCalledWith({
        where: { vehicleId: 'v-1', userId: 'user-1' },
        orderBy: { createdAt: 'asc' },
        take: 60,
      });
    });
  });

  describe('clearMessages', () => {
    it('deletes all messages for vehicle', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({ id: 'v-1', userId: 'user-1' });
      prisma.assistantMessage.deleteMany.mockResolvedValue({ count: 5 });

      const res = await service.clearMessages('user-1', 'v-1');
      expect(res).toEqual({ success: true });
      expect(prisma.assistantMessage.deleteMany).toHaveBeenCalledWith({
        where: { vehicleId: 'v-1', userId: 'user-1' },
      });
    });
  });

  describe('chat', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('saves user message and model reply for simple text chat', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v-1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2018,
        mileage: 120000,
        serviceIntervals: [],
        parts: [],
        expenses: [],
      });

      prisma.assistantMessage.create
        .mockResolvedValueOnce({
          id: 'msg-user',
          role: 'user',
          content: 'Нужны свечи',
        })
        .mockResolvedValueOnce({
          id: 'msg-model',
          role: 'model',
          content: 'Вот артикулы на Автодоке',
        });

      prisma.assistantMessage.findMany.mockResolvedValueOnce([
        { id: 'msg-user', role: 'user', content: 'Нужны свечи' },
      ]);

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [{ text: 'Вот артикулы на Автодоке' }],
              },
            },
          ],
        }),
      } as any);

      const res = await service.chat('user-1', 'v-1', 'Нужны свечи');

      expect(res.userMessage.content).toBe('Нужны свечи');
      expect(res.modelMessage.content).toBe('Вот артикулы на Автодоке');
      expect(res.actionTaken).toBeNull();
      expect(prisma.assistantMessage.create).toHaveBeenCalledTimes(2);
    });

    it('handles create_expense tool call and performs turn 2 confirmation', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v-1',
        brand: 'Kia',
        model: 'Rio',
        year: 2019,
        mileage: 85000,
        serviceIntervals: [],
        parts: [],
        expenses: [],
      });

      prisma.assistantMessage.create
        .mockResolvedValueOnce({
          id: 'msg-user',
          role: 'user',
          content: 'Заправка 2000 рублей, 40 л',
        })
        .mockResolvedValueOnce({
          id: 'msg-model',
          role: 'model',
          content: 'Записал заправку на 2000 ₽!',
        });

      prisma.assistantMessage.findMany.mockResolvedValueOnce([]);

      expenseService.create.mockResolvedValue({
        id: 'exp-1',
        amount: 2000,
        category: { name: 'Топливо' },
      });

      const mockFetch = jest
        .fn()
        // Turn 1: model calls create_expense
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      functionCall: {
                        name: 'create_expense',
                        args: {
                          amount: 2000,
                          categorySlug: 'fuel',
                          liters: 40,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          }),
        } as any)
        // Turn 2: model generates verbal confirmation
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Записал заправку на 2000 ₽!' }],
                },
              },
            ],
          }),
        } as any);

      global.fetch = mockFetch;

      const res = await service.chat(
        'user-1',
        'v-1',
        'Заправка 2000 рублей, 40 л',
      );

      expect(expenseService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2000,
          categoryId: 'cat-fuel',
          liters: 40,
        }),
        'user-1',
      );
      expect(res.actionTaken).toBe('created');
      expect(res.modelMessage.content).toBe('Записал заправку на 2000 ₽!');
    });

    it('handles delete_expense tool call and removes expense', async () => {
      prisma.vehicle.findFirst.mockResolvedValue({
        id: 'v-1',
        brand: 'Kia',
        model: 'Rio',
        year: 2019,
        mileage: 85000,
        serviceIntervals: [],
        parts: [],
        expenses: [],
      });

      prisma.assistantMessage.create
        .mockResolvedValueOnce({
          id: 'msg-user',
          role: 'user',
          content: 'Да, удаляй',
        })
        .mockResolvedValueOnce({
          id: 'msg-model',
          role: 'model',
          content: 'Удалил расход на мойку 600 ₽.',
        });

      prisma.assistantMessage.findMany.mockResolvedValueOnce([]);

      prisma.expense.findFirst.mockResolvedValue({
        id: 'exp-99',
        amount: 600,
        category: { name: 'Мойка' },
        description: 'кузов',
      });

      expenseService.remove.mockResolvedValue({ id: 'exp-99' });

      const mockFetch = jest
        .fn()
        // Turn 1: model calls delete_expense
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      functionCall: {
                        name: 'delete_expense',
                        args: { expenseId: 'exp-99' },
                      },
                    },
                  ],
                },
              },
            ],
          }),
        } as any)
        // Turn 2: model verbal reply
        .mockResolvedValueOnce({
          json: jest.fn().mockResolvedValue({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Удалил расход на мойку 600 ₽.' }],
                },
              },
            ],
          }),
        } as any);

      global.fetch = mockFetch;

      const res = await service.chat('user-1', 'v-1', 'Да, удаляй');

      expect(expenseService.remove).toHaveBeenCalledWith('exp-99', 'user-1');
      expect(res.actionTaken).toBe('deleted');
      expect(res.modelMessage.content).toBe('Удалил расход на мойку 600 ₽.');
    });
  });
});
