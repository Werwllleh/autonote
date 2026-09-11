import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer');

describe('MailService reminders', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = module.get(MailService);
  });

  it('sendVerificationReminder emails the verify link to the given address', async () => {
    await service.sendVerificationReminder('user@test.com', 'tok123');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.stringContaining('подтвердите'),
        html: expect.stringContaining('tok123'),
      }),
    );
  });

  it('sendExpenseReminder emails a nudge to the given address', async () => {
    await service.sendExpenseReminder('user@test.com');

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: expect.stringContaining('расход'),
      }),
    );
  });
});
