import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { NotificationService } from './notification.service';
import { Job } from 'bull';

describe('EmailProcessor', () => {
  let processor: EmailProcessor;
  let notificationService: NotificationService;

  const mockNotificationService = {
    processSendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
    notificationService = module.get<NotificationService>(NotificationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('handleSendEmail', () => {
    const mockJobData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test email content',
      html: '<p>Test email content</p>',
    };

    it('should process email job successfully', async () => {
      const mockJob = {
        data: mockJobData,
      } as Job;

      mockNotificationService.processSendEmail.mockResolvedValue(undefined);

      const result = await processor.handleSendEmail(mockJob);

      expect(notificationService.processSendEmail).toHaveBeenCalledWith({
        to: mockJobData.to,
        subject: mockJobData.subject,
        text: mockJobData.text,
        html: mockJobData.html,
      });
      expect(result).toBeUndefined();
    });

    it('should process email job without html content', async () => {
      const jobDataWithoutHtml = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test email content',
      };
      const mockJob = {
        data: jobDataWithoutHtml,
      } as Job;

      mockNotificationService.processSendEmail.mockResolvedValue(undefined);

      const result = await processor.handleSendEmail(mockJob);

      expect(notificationService.processSendEmail).toHaveBeenCalledWith({
        to: jobDataWithoutHtml.to,
        subject: jobDataWithoutHtml.subject,
        text: jobDataWithoutHtml.text,
        html: undefined,
      });
      expect(result).toBeUndefined();
    });

    it('should handle service errors gracefully', async () => {
      const mockJob = {
        data: mockJobData,
      } as Job;

      const error = new Error('Email processing error');
      mockNotificationService.processSendEmail.mockRejectedValue(error);

      await expect(processor.handleSendEmail(mockJob)).rejects.toThrow(
        'Email processing error',
      );
    });

    it('should handle empty job data', async () => {
      const emptyJobData = {
        to: '',
        subject: '',
        text: '',
      };
      const mockJob = {
        data: emptyJobData,
      } as Job;

      mockNotificationService.processSendEmail.mockResolvedValue(undefined);

      const result = await processor.handleSendEmail(mockJob);

      expect(notificationService.processSendEmail).toHaveBeenCalledWith({
        to: '',
        subject: '',
        text: '',
        html: undefined,
      });
      expect(result).toBeUndefined();
    });

    it('should handle special characters in email data', async () => {
      const specialJobData = {
        to: 'test+special@example-domain.com',
        subject: 'Test Subject with Special Chars: !@#$%^&*()',
        text: 'Test content with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        html: '<p>Test content with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?</p>',
      };
      const mockJob = {
        data: specialJobData,
      } as Job;

      mockNotificationService.processSendEmail.mockResolvedValue(undefined);

      const result = await processor.handleSendEmail(mockJob);

      expect(notificationService.processSendEmail).toHaveBeenCalledWith({
        to: specialJobData.to,
        subject: specialJobData.subject,
        text: specialJobData.text,
        html: specialJobData.html,
      });
      expect(result).toBeUndefined();
    });

    it('should handle very long email content', async () => {
      const longContent = 'A'.repeat(10000);
      const longJobData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: longContent,
        html: `<p>${longContent}</p>`,
      };
      const mockJob = {
        data: longJobData,
      } as Job;

      mockNotificationService.processSendEmail.mockResolvedValue(undefined);

      const result = await processor.handleSendEmail(mockJob);

      expect(notificationService.processSendEmail).toHaveBeenCalledWith({
        to: longJobData.to,
        subject: longJobData.subject,
        text: longJobData.text,
        html: longJobData.html,
      });
      expect(result).toBeUndefined();
    });
  });
});
