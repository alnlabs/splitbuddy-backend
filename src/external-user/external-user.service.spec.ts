import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExternalUserService } from './external-user.service';
import { ExternalUser } from '../entities/external-user.entity';
import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import { NotificationService } from '../notification/notification.service';
import {
  CreateExternalUserDto,
  UpdateExternalUserDto,
  ExternalUserQueryDto,
} from './external-user.dto';

describe('ExternalUserService', () => {
  let service: ExternalUserService;
  let externalUserRepository: Repository<ExternalUser>;
  let userRepository: Repository<User>;
  let userSettingsRepository: Repository<UserSettings>;
  let notificationService: NotificationService;

  const mockExternalUser = {
    id: 'external-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    relationshipType: 'friend',
    isActive: true,
    createdBy: 'user-1',
    referenceEmail: 'creator@example.com',
    migratedToUserId: null,
    migratedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'creator@example.com',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true,
  };

  const mockUserSettings = {
    id: 'settings-1',
    userId: 'user-1',
    allowExternalUserCreation: true,
    defaultExternalUserRelationshipType: 'friend',
    allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalUserService,
        {
          provide: getRepositoryToken(ExternalUser),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              getOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserSettings),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
            sendInApp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalUserService>(ExternalUserService);
    externalUserRepository = module.get<Repository<ExternalUser>>(
      getRepositoryToken(ExternalUser),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userSettingsRepository = module.get<Repository<UserSettings>>(
      getRepositoryToken(UserSettings),
    );
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an external user successfully', async () => {
      const createDto: CreateExternalUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
        relationshipType: 'friend',
      };

      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(mockUserSettings as UserSettings);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(externalUserRepository, 'create')
        .mockReturnValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(externalUserRepository, 'save')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockExternalUser);
      expect(externalUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          relationshipType: 'friend',
          createdBy: 'user-1',
          referenceEmail: 'creator@example.com',
        }),
      );
    });

    it('should throw BadRequestException when external user creation is not allowed', async () => {
      const createDto: CreateExternalUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        relationshipType: 'friend',
      };

      const disabledSettings = {
        ...mockUserSettings,
        allowExternalUserCreation: false,
      };
      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(disabledSettings as UserSettings);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when relationship type is not allowed', async () => {
      const createDto: CreateExternalUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        relationshipType: 'stranger',
      };

      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(mockUserSettings as UserSettings);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use default relationship type when not provided', async () => {
      const createDto: CreateExternalUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      };

      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(mockUserSettings as UserSettings);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(externalUserRepository, 'create')
        .mockReturnValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(externalUserRepository, 'save')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      await service.create(createDto, 'user-1');

      expect(externalUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          relationshipType: 'friend',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all external users with pagination', async () => {
      const query: ExternalUserQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockExternalUsers = [mockExternalUser];
      jest.spyOn(externalUserRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockExternalUsers),
        getCount: jest.fn().mockResolvedValue(1),
      } as any);

      const result = await service.findAll(query, 'user-1');

      expect(result).toEqual(mockExternalUsers);
    });
  });

  describe('findById', () => {
    it('should return an external user by id', async () => {
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      const result = await service.findById('external-1', 'user-1');

      expect(result).toEqual(mockExternalUser);
      expect(externalUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'external-1', createdBy: 'user-1' },
      });
    });

    it('should throw NotFoundException when external user is not found', async () => {
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an external user', async () => {
      const updateDto: UpdateExternalUserDto = {
        firstName: 'Jane Updated',
        relationshipType: 'family',
      };

      const updatedUser = { ...mockExternalUser, ...updateDto };
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(externalUserRepository, 'save')
        .mockResolvedValue(updatedUser as ExternalUser);

      const result = await service.update('external-1', updateDto, 'user-1');

      expect(result).toEqual(updatedUser);
      expect(externalUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it('should throw NotFoundException when external user is not found', async () => {
      const updateDto: UpdateExternalUserDto = { firstName: 'Updated' };

      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete an external user', async () => {
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);
      jest.spyOn(externalUserRepository, 'save').mockResolvedValue({
        ...mockExternalUser,
        isActive: false,
      } as ExternalUser);

      await service.delete('external-1', 'user-1');

      expect(externalUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'external-1',
          isActive: false,
        }),
      );
    });

    it('should throw NotFoundException when external user is not found', async () => {
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.delete('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('migrateToInternalUser', () => {
    it('should migrate external user to internal user', async () => {
      const userData = {
        username: 'jane.smith',
        password: 'password123',
        email: 'jane@example.com',
      };

      const newInternalUser = {
        id: 'new-user-1',
        username: 'jane.smith',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        enabled: true,
      };

      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(newInternalUser as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(newInternalUser as User);
      jest.spyOn(externalUserRepository, 'save').mockResolvedValue({
        ...mockExternalUser,
        migratedToUserId: 'new-user-1',
        migratedAt: expect.any(Date),
      } as ExternalUser);

      const result = await service.migrateToInternalUser(
        'external-1',
        userData,
      );

      expect(result).toEqual(newInternalUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'jane.smith',
          email: 'jane@example.com',
          firstName: 'Jane Updated',
          lastName: 'Smith',
          phone: '+1234567890',
          enabled: true,
        }),
      );
      expect(externalUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'external-1',
          migratedToUserId: 'new-user-1',
          migratedAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when external user is not found', async () => {
      const userData = {
        username: 'jane.smith',
        password: 'password123',
        email: 'jane@example.com',
      };

      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.migrateToInternalUser('non-existent', userData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOrCreateExternalUser', () => {
    it('should find existing external user by email', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      };

      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(mockUserSettings as UserSettings);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.findOrCreateExternalUser(userData, 'user-1');

      expect(result).toEqual(mockExternalUser);
      expect(externalUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'jane@example.com', isActive: true },
      });
    });

    it('should create new external user when not found', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1234567890',
      };

      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userSettingsRepository, 'findOne')
        .mockResolvedValue(mockUserSettings as UserSettings);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(externalUserRepository, 'create')
        .mockReturnValue(mockExternalUser as ExternalUser);
      jest
        .spyOn(externalUserRepository, 'save')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      const result = await service.findOrCreateExternalUser(userData, 'user-1');

      expect(result).toEqual(mockExternalUser);
      expect(externalUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+1234567890',
          createdBy: 'user-1',
          referenceEmail: 'creator@example.com',
        }),
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for external user', async () => {
      const mockUserForReset = { ...mockExternalUser, migratedToUserId: null };
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockUserForReset as ExternalUser);
      jest.spyOn(notificationService, 'sendEmail').mockResolvedValue();

      const result = await service.requestPasswordReset('jane@example.com');

      expect(result).toEqual({
        success: true,
        message: expect.stringContaining('Password reset request received'),
      });
    });

    it('should not reveal user existence when email not found', async () => {
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await service.requestPasswordReset('nonexistent@example.com');

      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('requestPhoneReset', () => {
    it('should send phone reset email for external user', async () => {
      const mockUserForReset = { ...mockExternalUser, migratedToUserId: null };
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockUserForReset as ExternalUser);
      jest.spyOn(notificationService, 'sendEmail').mockResolvedValue();

      const result = await service.requestPhoneReset('jane@example.com');

      expect(result).toEqual({
        success: true,
        message: expect.stringContaining('Phone verification request received'),
      });
    });

    it('should not reveal user existence when email not found', async () => {
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await service.requestPhoneReset('nonexistent@example.com');

      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('getExternalUserByEmailOrPhone', () => {
    it('should find external user by email', async () => {
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      const result =
        await service.getExternalUserByEmailOrPhone('jane@example.com');

      expect(result).toEqual(mockExternalUser);
      expect(externalUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: 'jane@example.com', isActive: true },
          { phone: 'jane@example.com', isActive: true },
        ],
      });
    });

    it('should find external user by phone', async () => {
      jest
        .spyOn(externalUserRepository, 'findOne')
        .mockResolvedValue(mockExternalUser as ExternalUser);

      const result = await service.getExternalUserByEmailOrPhone('+1234567890');

      expect(result).toEqual(mockExternalUser);
    });

    it('should return null when user not found', async () => {
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getExternalUserByEmailOrPhone(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });
});
