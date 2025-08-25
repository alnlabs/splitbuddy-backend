import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, CreateUserDto, LoginDto, GoogleAuthDto } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { App } from '../entities/app.entity';
import { NotificationService } from '../notification/notification.service';
import { DefaultDataService } from '../services/default-data.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

// Mock google-auth-library
jest.mock('google-auth-library');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: JwtService;
  let notificationService: NotificationService;
  let defaultDataService: DefaultDataService;
  let mockOAuth2Client: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGooglePayload = {
    sub: 'google-user-id',
    email: 'google@example.com',
    given_name: 'Google',
    family_name: 'User',
    picture: 'https://example.com/avatar.jpg',
  };

  beforeEach(async () => {
    // Mock OAuth2Client
    mockOAuth2Client = {
      verifyIdToken: jest.fn(),
    };
    (OAuth2Client as jest.MockedClass<typeof OAuth2Client>).mockImplementation(() => mockOAuth2Client);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Client),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(App),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
            sendInApp: jest.fn(),
          },
        },
        {
          provide: DefaultDataService,
          useValue: {
            createDefaultDataForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    notificationService = module.get<NotificationService>(NotificationService);
    defaultDataService = module.get<DefaultDataService>(DefaultDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.validateUser({ sub: 'user-1' });

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.validateUser({ sub: 'non-existent' });

      expect(result).toBeNull();
    });
  });

  describe('googleVerify', () => {
    it('should verify Google token successfully', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockGooglePayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket);

      const result = await service.googleVerify('valid-token');

      expect(result).toEqual(mockGooglePayload);
      expect(mockOAuth2Client.verifyIdToken).toHaveBeenCalledWith({
        idToken: 'valid-token',
        audience: expect.any(String),
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockOAuth2Client.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.googleVerify('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
      jest.spyOn(defaultDataService, 'createDefaultDataForUser').mockResolvedValue({
        paymentMethods: [],
        categories: [],
      });
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        success: true,
        data: {
          token: 'jwt-token',
          userProfile: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            username: mockUser.email,
          },
        },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'new@example.com' },
      });
      expect(defaultDataService.createDefaultDataForUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException when user already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const userWithCorrectPassword = { ...mockUser, password: 'password123' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithCorrectPassword);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        success: true,
        data: {
          token: 'jwt-token',
          userProfile: {
            id: userWithCorrectPassword.id,
            email: userWithCorrectPassword.email,
            firstName: userWithCorrectPassword.firstName,
            lastName: userWithCorrectPassword.lastName,
            username: userWithCorrectPassword.email,
          },
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('googleLogin', () => {
    const googleAuthDto: GoogleAuthDto = {
      idToken: 'google-token',
    };

    it('should login existing Google user successfully', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockGooglePayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.googleLogin(googleAuthDto);

      expect(result).toEqual({
        success: true,
        data: {
          token: 'jwt-token',
          userProfile: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            username: mockUser.email,
          },
        },
      });
    });

    it('should throw UnauthorizedException for non-existent Google user', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockGooglePayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.googleLogin(googleAuthDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.updateProfile('user-1', updateData);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userWithCorrectPassword = { ...mockUser, password: 'oldPassword' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userWithCorrectPassword);
      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 });

      await service.changePassword('user-1', 'oldPassword', 'newPassword');

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        password: 'newPassword',
      }));
    });

    it('should throw UnauthorizedException for invalid old password', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        service.changePassword('user-1', 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(notificationService, 'sendEmail').mockResolvedValue();

      await service.requestPasswordReset('test@example.com');

      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringContaining('Password Reset'),
        expect.stringContaining('reset your password'),
      );
    });

    it('should not send email for non-existent user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await service.requestPasswordReset('nonexistent@example.com');

      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-1' });
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      await service.resetPassword('valid-token', 'newPassword');

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        password: 'newPassword',
      }));
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestEmailVerification', () => {
    it('should send email verification', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(notificationService, 'sendEmail').mockResolvedValue();

      await service.requestEmailVerification('test@example.com');

      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringContaining('Email Verification'),
        expect.stringContaining('verify your email'),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-1' });
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      await service.verifyEmail('valid-token');

      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        activated: true,
      }));
    });
  });

  describe('googleSignup', () => {
    const googleAuthDto: GoogleAuthDto = {
      idToken: 'google-token',
    };

    it('should signup new Google user successfully', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockGooglePayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);
      jest.spyOn(defaultDataService, 'createDefaultDataForUser').mockResolvedValue({
        paymentMethods: [],
        categories: [],
      });
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.googleSignup(googleAuthDto);

      expect(result).toEqual({
        success: true,
        data: {
          token: 'jwt-token',
          userProfile: {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            username: mockUser.email,
          },
        },
      });
      expect(defaultDataService.createDefaultDataForUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw BadRequestException when Google user already exists', async () => {
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockGooglePayload),
      };
      mockOAuth2Client.verifyIdToken.mockResolvedValue(mockTicket);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.googleSignup(googleAuthDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.logout('user-1');

      expect(result).toEqual({
        message: 'Logout successful',
        success: true,
      });
    });
  });
});
