import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { Job } from 'bull';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let notificationService: NotificationService;

  const mockNotificationService = {
    processSendInApp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    notificationService = module.get<NotificationService>(NotificationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('handleSendInApp', () => {
    const mockJobData = {
      userId: 'user-123',
      message: 'Test in-app notification message',
    };

    it('should process in-app notification job successfully', async () => {
      const mockJob = {
        data: mockJobData,
      } as Job;

      const mockSavedNotification = {
        id: 'notification-123',
        recipient: mockJobData.userId,
        type: 'in-app',
        content: mockJobData.message,
        status: 'SENT',
      };
      mockNotificationService.processSendInApp.mockResolvedValue(
        mockSavedNotification,
      );

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        mockJobData.userId,
        mockJobData.message,
      );
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle service errors gracefully', async () => {
      const mockJob = {
        data: mockJobData,
      } as Job;

      const error = new Error('Notification processing error');
      mockNotificationService.processSendInApp.mockRejectedValue(error);

      await expect(processor.handleSendInApp(mockJob)).rejects.toThrow(
        'Notification processing error',
      );
    });

    it('should handle empty notification content', async () => {
      const emptyJobData = {
        userId: 'user-123',
        message: '',
      };
      const mockJob = {
        data: emptyJobData,
      } as Job;

      const mockSavedNotification = {
        id: 'notification-123',
        recipient: emptyJobData.userId,
        type: 'in-app',
        content: '',
        status: 'SENT',
      };
      mockNotificationService.processSendInApp.mockResolvedValue(
        mockSavedNotification,
      );

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        emptyJobData.userId,
        emptyJobData.message,
      );
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle special characters in notification content', async () => {
      const specialJobData = {
        userId: 'user-123',
        message:
          'Test notification with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };
      const mockJob = {
        data: specialJobData,
      } as Job;

      const mockSavedNotification = {
        id: 'notification-123',
        recipient: specialJobData.userId,
        type: 'in-app',
        content: specialJobData.message,
        status: 'SENT',
      };
      mockNotificationService.processSendInApp.mockResolvedValue(
        mockSavedNotification,
      );

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        specialJobData.userId,
        specialJobData.message,
      );
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle very long notification content', async () => {
      const longContent = 'A'.repeat(10000);
      const longJobData = {
        userId: 'user-123',
        message: longContent,
      };
      const mockJob = {
        data: longJobData,
      } as Job;

      const mockSavedNotification = {
        id: 'notification-123',
        recipient: longJobData.userId,
        type: 'in-app',
        content: longContent,
        status: 'SENT',
      };
      mockNotificationService.processSendInApp.mockResolvedValue(
        mockSavedNotification,
      );

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        longJobData.userId,
        longJobData.message,
      );
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle empty user ID', async () => {
      const emptyUserIdJobData = {
        userId: '',
        message: 'Test notification',
      };
      const mockJob = {
        data: emptyUserIdJobData,
      } as Job;

      const mockSavedNotification = {
        id: 'notification-123',
        recipient: '',
        type: 'in-app',
        content: emptyUserIdJobData.message,
        status: 'SENT',
      };
      mockNotificationService.processSendInApp.mockResolvedValue(
        mockSavedNotification,
      );

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        emptyUserIdJobData.userId,
        emptyUserIdJobData.message,
      );
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle null/undefined job data gracefully', async () => {
      const nullJobData = {
        userId: null,
        message: null,
      };
      const mockJob = {
        data: nullJobData,
      } as Job;

      mockNotificationService.processSendInApp.mockResolvedValue(null);

      const result = await processor.handleSendInApp(mockJob);

      expect(notificationService.processSendInApp).toHaveBeenCalledWith(
        null,
        null,
      );
      expect(result).toBeNull();
    });
  });
});
