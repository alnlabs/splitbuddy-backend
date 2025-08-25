import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { Notification } from './notification.entity';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    sendEmail: jest.fn(),
    sendInApp: jest.fn(),
    listNotifications: jest.fn(),
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getQueueToken('email'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getQueueToken('notification'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    const sendEmailDto = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test email content',
      html: '<p>Test email content</p>',
    };

    it('should send email successfully', async () => {
      mockNotificationService.sendEmail.mockResolvedValue(undefined);

      const result = await controller.sendEmail(sendEmailDto);

      expect(service.sendEmail).toHaveBeenCalledWith(
        sendEmailDto.to,
        sendEmailDto.subject,
        sendEmailDto.text,
        sendEmailDto.html,
      );
      expect(result).toEqual({
        message: 'Email sent',
        result: undefined,
      });
    });

    it('should send email without html content', async () => {
      const dtoWithoutHtml = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test email content',
      };
      mockNotificationService.sendEmail.mockResolvedValue(undefined);

      const result = await controller.sendEmail(dtoWithoutHtml);

      expect(service.sendEmail).toHaveBeenCalledWith(
        dtoWithoutHtml.to,
        dtoWithoutHtml.subject,
        dtoWithoutHtml.text,
        undefined,
      );
      expect(result).toEqual({
        message: 'Email sent',
        result: undefined,
      });
    });

    it('should handle email service errors', async () => {
      const error = new Error('Email service error');
      mockNotificationService.sendEmail.mockRejectedValue(error);

      await expect(controller.sendEmail(sendEmailDto)).rejects.toThrow(
        'Email service error',
      );
    });

    it('should handle empty email data', async () => {
      const emptyDto = {
        to: '',
        subject: '',
        text: '',
      };
      mockNotificationService.sendEmail.mockResolvedValue(undefined);

      const result = await controller.sendEmail(emptyDto);

      expect(service.sendEmail).toHaveBeenCalledWith('', '', '', undefined);
      expect(result).toEqual({
        message: 'Email sent',
        result: undefined,
      });
    });
  });

  describe('sendInApp', () => {
    const sendInAppDto = {
      userId: 'user-123',
      content: 'Test in-app notification',
    };

    it('should send in-app notification successfully', async () => {
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await controller.sendInApp(sendInAppDto);

      expect(service.sendInApp).toHaveBeenCalledWith(
        sendInAppDto.userId,
        sendInAppDto.content,
      );
      expect(result).toEqual({
        message: 'In-app notification sent',
        result: undefined,
      });
    });

    it('should handle in-app notification service errors', async () => {
      const error = new Error('Notification service error');
      mockNotificationService.sendInApp.mockRejectedValue(error);

      await expect(controller.sendInApp(sendInAppDto)).rejects.toThrow(
        'Notification service error',
      );
    });

    it('should handle empty notification content', async () => {
      const emptyDto = {
        userId: 'user-123',
        content: '',
      };
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await controller.sendInApp(emptyDto);

      expect(service.sendInApp).toHaveBeenCalledWith('user-123', '');
      expect(result).toEqual({
        message: 'In-app notification sent',
        result: undefined,
      });
    });

    it('should handle special characters in notification content', async () => {
      const specialContentDto = {
        userId: 'user-123',
        content:
          'Test notification with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await controller.sendInApp(specialContentDto);

      expect(service.sendInApp).toHaveBeenCalledWith(
        specialContentDto.userId,
        specialContentDto.content,
      );
      expect(result).toEqual({
        message: 'In-app notification sent',
        result: undefined,
      });
    });
  });

  describe('list', () => {
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

    it('should list all notifications when no filters provided', async () => {
      mockNotificationService.listNotifications.mockResolvedValue(
        mockNotifications,
      );

      const result = await controller.list();

      expect(service.listNotifications).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual({
        notifications: mockNotifications,
      });
    });

    it('should filter notifications by recipient', async () => {
      const recipient = 'user-123';
      mockNotificationService.listNotifications.mockResolvedValue([
        mockNotifications[0],
      ]);

      const result = await controller.list(recipient);

      expect(service.listNotifications).toHaveBeenCalledWith(
        recipient,
        undefined,
      );
      expect(result).toEqual({
        notifications: [mockNotifications[0]],
      });
    });

    it('should filter notifications by type', async () => {
      const type = 'in-app';
      mockNotificationService.listNotifications.mockResolvedValue([
        mockNotifications[0],
      ]);

      const result = await controller.list(undefined, type);

      expect(service.listNotifications).toHaveBeenCalledWith(undefined, type);
      expect(result).toEqual({
        notifications: [mockNotifications[0]],
      });
    });

    it('should filter notifications by both recipient and type', async () => {
      const recipient = 'user-123';
      const type = 'in-app';
      mockNotificationService.listNotifications.mockResolvedValue([
        mockNotifications[0],
      ]);

      const result = await controller.list(recipient, type);

      expect(service.listNotifications).toHaveBeenCalledWith(recipient, type);
      expect(result).toEqual({
        notifications: [mockNotifications[0]],
      });
    });

    it('should handle empty notifications list', async () => {
      mockNotificationService.listNotifications.mockResolvedValue([]);

      const result = await controller.list();

      expect(service.listNotifications).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual({
        notifications: [],
      });
    });

    it('should handle service errors when listing notifications', async () => {
      const error = new Error('Database error');
      mockNotificationService.listNotifications.mockRejectedValue(error);

      await expect(controller.list()).rejects.toThrow('Database error');
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notification-123';
    const mockUpdatedNotification = {
      id: notificationId,
      recipient: 'user-123',
      type: 'in-app',
      content: 'Test notification',
      status: 'READ',
    };

    it('should mark notification as read successfully', async () => {
      mockNotificationService.markAsRead.mockResolvedValue(
        mockUpdatedNotification,
      );

      const result = await controller.markAsRead(notificationId);

      expect(service.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual({
        message: 'Notification marked as read',
        result: mockUpdatedNotification,
      });
    });

    it('should handle notification not found error', async () => {
      const error = new Error('Notification not found');
      mockNotificationService.markAsRead.mockRejectedValue(error);

      await expect(controller.markAsRead(notificationId)).rejects.toThrow(
        'Notification not found',
      );
    });

    it('should handle service errors when marking as read', async () => {
      const error = new Error('Database error');
      mockNotificationService.markAsRead.mockRejectedValue(error);

      await expect(controller.markAsRead(notificationId)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle empty notification id', async () => {
      const emptyId = '';
      mockNotificationService.markAsRead.mockRejectedValue(
        new Error('Notification not found'),
      );

      await expect(controller.markAsRead(emptyId)).rejects.toThrow(
        'Notification not found',
      );
    });

    it('should handle invalid notification id format', async () => {
      const invalidId = 'invalid-uuid-format';
      mockNotificationService.markAsRead.mockRejectedValue(
        new Error('Invalid ID format'),
      );

      await expect(controller.markAsRead(invalidId)).rejects.toThrow(
        'Invalid ID format',
      );
    });
  });

  describe('edge cases and validation', () => {
    it('should handle undefined parameters gracefully', async () => {
      // Test with undefined parameters
      mockNotificationService.listNotifications.mockResolvedValue([]);

      await expect(
        controller.list(undefined, undefined),
      ).resolves.toBeDefined();
    });

    it('should handle very long content in notifications', async () => {
      const longContentDto = {
        userId: 'user-123',
        content: 'A'.repeat(10000), // Very long content
      };
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await controller.sendInApp(longContentDto);

      expect(service.sendInApp).toHaveBeenCalledWith(
        longContentDto.userId,
        longContentDto.content,
      );
      expect(result).toEqual({
        message: 'In-app notification sent',
        result: undefined,
      });
    });

    it('should handle special characters in email addresses', async () => {
      const specialEmailDto = {
        to: 'test+special@example-domain.com',
        subject: 'Test Subject',
        text: 'Test content',
      };
      mockNotificationService.sendEmail.mockResolvedValue(undefined);

      const result = await controller.sendEmail(specialEmailDto);

      expect(service.sendEmail).toHaveBeenCalledWith(
        specialEmailDto.to,
        specialEmailDto.subject,
        specialEmailDto.text,
        undefined,
      );
      expect(result).toEqual({
        message: 'Email sent',
        result: undefined,
      });
    });
  });
});
