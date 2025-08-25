import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { Queue } from 'bull';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepo: Repository<Notification>;
  let emailQueue: Queue;
  let notificationQueue: Queue;

  const mockNotificationRepo = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEmailQueue = {
    add: jest.fn(),
  };

  const mockNotificationQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepo,
        },
        {
          provide: getQueueToken('email'),
          useValue: mockEmailQueue,
        },
        {
          provide: getQueueToken('notification'),
          useValue: mockNotificationQueue,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepo = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    emailQueue = module.get<Queue>(getQueueToken('email'));
    notificationQueue = module.get<Queue>(getQueueToken('notification'));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test email content',
      html: '<p>Test email content</p>',
    };

    it('should queue email when Redis is available', async () => {
      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.sendEmail(
        emailData.to,
        emailData.subject,
        emailData.text,
        emailData.html,
      );

      expect(emailQueue.add).toHaveBeenCalledWith('send-email', {
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        smtp: {
          host: expect.any(String),
          port: expect.any(Number),
          user: expect.any(String),
          pass: expect.any(String),
          from: expect.any(String),
        },
      });
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log email when Redis is not available', async () => {
      // Create a new instance without Redis
      const moduleWithoutRedis: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: NotificationService,
            useFactory: () => {
              const service = new NotificationService(
                mockEmailQueue as any,
                mockNotificationQueue as any,
                mockNotificationRepo as any,
              );
              // Mock the hasRedis property to false
              Object.defineProperty(service, 'hasRedis', { value: false });
              return service;
            },
          },
          {
            provide: getRepositoryToken(Notification),
            useValue: mockNotificationRepo,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockEmailQueue,
          },
          {
            provide: getQueueToken('notification'),
            useValue: mockNotificationQueue,
          },
        ],
      }).compile();

      const serviceWithoutRedis =
        moduleWithoutRedis.get<NotificationService>(NotificationService);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await serviceWithoutRedis.sendEmail(
        emailData.to,
        emailData.subject,
        emailData.text,
      );

      expect(emailQueue.add).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        `[EMAIL] To: ${emailData.to}, Subject: ${emailData.subject}, Text: ${emailData.text}`,
      );

      consoleSpy.mockRestore();
    });

    it('should handle email queue errors gracefully', async () => {
      const error = new Error('Queue error');
      mockEmailQueue.add.mockRejectedValue(error);

      await expect(
        service.sendEmail(emailData.to, emailData.subject, emailData.text),
      ).rejects.toThrow('Queue error');
    });
  });

  describe('sendInApp', () => {
    const notificationData = {
      userId: 'user-123',
      message: 'Test notification message',
    };

    it('should queue notification when Redis is available', async () => {
      await service.sendInApp(
        notificationData.userId,
        notificationData.message,
      );

      expect(notificationQueue.add).toHaveBeenCalledWith('send-notification', {
        userId: notificationData.userId,
        message: notificationData.message,
      });
    });

    it('should save notification directly when Redis is not available', async () => {
      // Create a new instance without Redis
      const moduleWithoutRedis: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: NotificationService,
            useFactory: () => {
              const service = new NotificationService(
                mockEmailQueue as any,
                mockNotificationQueue as any,
                mockNotificationRepo as any,
              );
              // Mock the hasRedis property to false
              Object.defineProperty(service, 'hasRedis', { value: false });
              return service;
            },
          },
          {
            provide: getRepositoryToken(Notification),
            useValue: mockNotificationRepo,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockEmailQueue,
          },
          {
            provide: getQueueToken('notification'),
            useValue: mockNotificationQueue,
          },
        ],
      }).compile();

      const serviceWithoutRedis =
        moduleWithoutRedis.get<NotificationService>(NotificationService);
      const mockSavedNotification = {
        id: 'notification-123',
        recipient: notificationData.userId,
        type: 'in-app',
        content: notificationData.message,
        status: 'SENT',
      };
      mockNotificationRepo.save.mockResolvedValue(mockSavedNotification);

      await serviceWithoutRedis.sendInApp(
        notificationData.userId,
        notificationData.message,
      );

      expect(notificationQueue.add).not.toHaveBeenCalled();
      expect(notificationRepo.save).toHaveBeenCalledWith({
        recipient: notificationData.userId,
        type: 'in-app',
        content: notificationData.message,
        status: 'SENT',
      });
    });

    it('should handle notification queue errors gracefully', async () => {
      const error = new Error('Queue error');
      mockNotificationQueue.add.mockRejectedValue(error);

      await expect(
        service.sendInApp(notificationData.userId, notificationData.message),
      ).rejects.toThrow('Queue error');
    });
  });

  describe('listNotifications', () => {
    const mockNotifications = [
      {
        id: 'notification-1',
        recipient: 'user-123',
        type: 'in-app',
        content: 'Test notification 1',
        status: 'SENT',
        createdAt: new Date(),
      },
      {
        id: 'notification-2',
        recipient: 'user-123',
        type: 'email',
        content: 'Test notification 2',
        status: 'READ',
        createdAt: new Date(),
      },
    ];

    it('should return all notifications when no filters are provided', async () => {
      mockNotificationRepo.find.mockResolvedValue(mockNotifications);

      const result = await service.listNotifications();

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should filter notifications by recipient', async () => {
      const recipient = 'user-123';
      mockNotificationRepo.find.mockResolvedValue([mockNotifications[0]]);

      const result = await service.listNotifications(recipient);

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { recipient },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should filter notifications by type', async () => {
      const type = 'in-app';
      mockNotificationRepo.find.mockResolvedValue([mockNotifications[0]]);

      const result = await service.listNotifications(undefined, type);

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { type },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should filter notifications by both recipient and type', async () => {
      const recipient = 'user-123';
      const type = 'in-app';
      mockNotificationRepo.find.mockResolvedValue([mockNotifications[0]]);

      const result = await service.listNotifications(recipient, type);

      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { recipient, type },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockNotifications[0]]);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockNotificationRepo.find.mockRejectedValue(error);

      await expect(service.listNotifications()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notification-123';
    const mockNotification = {
      id: notificationId,
      recipient: 'user-123',
      type: 'in-app',
      content: 'Test notification',
      status: 'SENT',
    };

    it('should mark notification as read successfully', async () => {
      const updatedNotification = { ...mockNotification, status: 'READ' };
      mockNotificationRepo.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepo.save.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId);

      expect(notificationRepo.findOne).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(notificationRepo.save).toHaveBeenCalledWith({
        ...mockNotification,
        status: 'READ',
      });
      expect(result).toEqual(updatedNotification);
    });

    it('should throw error when notification is not found', async () => {
      mockNotificationRepo.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        'Notification not found',
      );

      expect(notificationRepo.findOne).toHaveBeenCalledWith({
        where: { id: notificationId },
      });
      expect(notificationRepo.save).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockNotificationRepo.findOne.mockRejectedValue(error);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('processSendEmail', () => {
    it('should log email notification processing', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const notification = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      await service.processSendEmail(notification);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sending email notification:',
        notification,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('processSendInApp', () => {
    it('should save in-app notification successfully', async () => {
      const userId = 'user-123';
      const content = 'Test in-app notification';
      const mockSavedNotification = {
        id: 'notification-123',
        recipient: userId,
        type: 'in-app',
        content,
        status: 'SENT',
      };

      mockNotificationRepo.save.mockResolvedValue(mockSavedNotification);

      const result = await service.processSendInApp(userId, content);

      expect(notificationRepo.save).toHaveBeenCalledWith({
        recipient: userId,
        type: 'in-app',
        content,
        status: 'SENT',
      });
      expect(result).toEqual(mockSavedNotification);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockNotificationRepo.save.mockRejectedValue(error);

      await expect(
        service.processSendInApp('user-123', 'Test content'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty or null parameters gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Create a new instance without Redis for this test
      const moduleWithoutRedis: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: NotificationService,
            useFactory: () => {
              const service = new NotificationService(
                mockEmailQueue as any,
                mockNotificationQueue as any,
                mockNotificationRepo as any,
              );
              // Mock the hasRedis property to false
              Object.defineProperty(service, 'hasRedis', { value: false });
              return service;
            },
          },
          {
            provide: getRepositoryToken(Notification),
            useValue: mockNotificationRepo,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockEmailQueue,
          },
          {
            provide: getQueueToken('notification'),
            useValue: mockNotificationQueue,
          },
        ],
      }).compile();

      const serviceWithoutRedis =
        moduleWithoutRedis.get<NotificationService>(NotificationService);

      // Test with empty strings
      await serviceWithoutRedis.sendEmail('', '', '');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[EMAIL] To: , Subject: , Text: ',
      );

      // Test with null/undefined (should not throw)
      await expect(
        serviceWithoutRedis.sendEmail(null as any, null as any, null as any),
      ).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle special characters in notification content', async () => {
      const specialContent =
        'Test notification with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

      // Create fresh mocks for this test
      const freshMockNotificationQueue = { add: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          {
            provide: getRepositoryToken(Notification),
            useValue: mockNotificationRepo,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockEmailQueue,
          },
          {
            provide: getQueueToken('notification'),
            useValue: freshMockNotificationQueue,
          },
        ],
      }).compile();

      const freshService = module.get<NotificationService>(NotificationService);

      await freshService.sendInApp('user-123', specialContent);

      expect(freshMockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        {
          userId: 'user-123',
          message: specialContent,
        },
      );
    });

    it('should handle very long notification content', async () => {
      const longContent = 'A'.repeat(10000); // Very long content

      // Create fresh mocks for this test
      const freshMockNotificationQueue = { add: jest.fn() };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          NotificationService,
          {
            provide: getRepositoryToken(Notification),
            useValue: mockNotificationRepo,
          },
          {
            provide: getQueueToken('email'),
            useValue: mockEmailQueue,
          },
          {
            provide: getQueueToken('notification'),
            useValue: freshMockNotificationQueue,
          },
        ],
      }).compile();

      const freshService = module.get<NotificationService>(NotificationService);

      await freshService.sendInApp('user-123', longContent);

      expect(freshMockNotificationQueue.add).toHaveBeenCalledWith(
        'send-notification',
        {
          userId: 'user-123',
          message: longContent,
        },
      );
    });
  });
});
