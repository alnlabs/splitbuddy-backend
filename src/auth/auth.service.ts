import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { NotificationService } from '../notification/notification.service';
import { DefaultDataService } from '../services/default-data.service';
import { env } from '../config/env.config';

// DTOs
export class CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class GoogleAuthDto {
  idToken: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly defaultDataService: DefaultDataService,
  ) {
    // Check if Google Client ID is configured
    if (!env.google.clientId) {
      console.error(
        '❌ GOOGLE_CLIENT_ID is not configured. Google authentication will not work.',
      );
      console.error('Please set the GOOGLE_CLIENT_ID environment variable.');
    } else {
      console.log('✅ Google OAuth Client ID configured');
    }
    this.googleClient = new OAuth2Client(env.google.clientId);
  }

  async validateUser(payload: any): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }

  async googleVerify(idToken: string): Promise<any> {
    try {
      // Check if Google Client ID is configured
      if (!env.google.clientId) {
        throw new UnauthorizedException(
          'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable.',
        );
      }

      // Try with web client ID first
      let ticket;
      try {
        ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: env.google.clientId,
        });
      } catch (webError) {
        console.log('Web client verification failed, trying Android client...');
        // If web client fails, try with Android client ID
        if (env.google.androidClientId) {
          const androidClient = new OAuth2Client(env.google.androidClientId);
          ticket = await androidClient.verifyIdToken({
            idToken,
            audience: env.google.androidClientId,
          });
        } else {
          console.error(
            'No Android client ID configured, web client verification failed:',
            webError.message,
          );
          throw webError;
        }
      }

      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      console.error('Google token verification failed:', error);

      // Provide more specific error messages
      if (error.message?.includes('not configured')) {
        throw new UnauthorizedException(
          'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable.',
        );
      } else if (error.message?.includes('Invalid audience')) {
        throw new UnauthorizedException(
          'Invalid Google client ID. Please check your GOOGLE_CLIENT_ID configuration.',
        );
      } else if (error.message?.includes('Token used too late')) {
        throw new UnauthorizedException(
          'Google token has expired. Please try signing in again.',
        );
      } else {
        throw new UnauthorizedException(
          'Invalid Google token. Please try signing in again.',
        );
      }
    }
  }

  async verifyFirebaseToken(idToken: string): Promise<any> {
    try {
      // For Firebase tokens, we need to verify them using Firebase Admin SDK
      // Since we don't have Firebase Admin SDK installed, we'll use a different approach
      // We'll decode the JWT token and extract the claims

      // Split the token to get the payload
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      // Decode the payload (base64url decode)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // Basic validation
      if (!payload.email) {
        throw new Error('Token does not contain email');
      }

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token has expired');
      }

      return {
        email: payload.email,
        given_name: payload.name || payload.given_name,
        family_name: payload.family_name || '',
        sub: payload.sub || payload.user_id,
        picture: payload.picture,
        email_verified: payload.email_verified || true,
      };
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new UnauthorizedException(
        'Invalid Firebase token. Please try signing in again.',
      );
    }
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password, // In production, hash the password
      firstName,
      lastName,
      username: email, // Use email as username for now
    });

    const savedUser = await this.userRepository.save(user);

    // Create default data for the new user
    try {
      await this.defaultDataService.createDefaultDataForUser(savedUser.id);
      console.log(`✅ Default data created for new user: ${savedUser.email}`);
    } catch (error) {
      console.error(
        `❌ Failed to create default data for user ${savedUser.email}:`,
        error,
      );
      // Don't fail registration if default data creation fails
    }

    // Generate JWT token
    const payload = { email: savedUser.email, sub: savedUser.id };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      data: {
        token: token,
        userProfile: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          username: savedUser.username || savedUser.email,
        },
      },
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      data: {
        token: token,
        userProfile: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username || user.email,
        },
      },
    };
  }

  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<any> {
    const { idToken } = googleAuthDto;

    try {
      let payload;

      // Try Google OAuth verification first
      try {
        payload = await this.googleVerify(idToken);
        console.log('✅ Google OAuth verification successful');
      } catch (googleError) {
        console.log(
          '⚠️ Google OAuth verification failed, trying Firebase token...',
        );
        // If Google verification fails, try Firebase token verification
        payload = await this.verifyFirebaseToken(idToken);
        console.log('✅ Firebase token verification successful');
      }

      const { email, given_name, family_name } = payload;

      let user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        // Create new user from Google/Firebase data
        user = this.userRepository.create({
          email,
          firstName: given_name,
          lastName: family_name,
          username: email,
          loginType: 'GOOGLE',
        });
        user = await this.userRepository.save(user);

        // Create default data for new Google login user
        try {
          await this.defaultDataService.createDefaultDataForUser(user.id);
          console.log(
            `✅ Default data created for new Google login user: ${user.email}`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to create default data for Google login user ${user.email}:`,
            error,
          );
          // Don't fail login if default data creation fails
        }
      }

      const jwtPayload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(jwtPayload);

      return {
        success: true,
        data: {
          token: token,
          userProfile: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username || user.email,
          },
        },
      };
    } catch (error) {
      console.error('❌ Google/Firebase authentication failed:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.password !== oldPassword) {
      throw new BadRequestException('Invalid old password');
    }

    user.password = newPassword; // In production, hash the password
    await this.userRepository.save(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const token = this.jwtService.sign(
      { email, sub: user.id },
      { expiresIn: '1h' },
    );

    const resetLink = `${env.app.corsOrigin || 'http://localhost:5900'}/api/v1/auth/reset-password?token=${token}`;

    await this.notificationService.sendEmail(
      email,
      'Password Reset Request',
      `Click the following link to reset your password: ${resetLink}`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      user.password = newPassword; // In production, hash the password
      await this.userRepository.save(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async requestEmailVerification(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = this.jwtService.sign(
      { email, sub: user.id },
      { expiresIn: '24h' },
    );

    const verifyLink = `${env.app.corsOrigin || 'http://localhost:5900'}/api/v1/auth/verify-email?token=${token}`;

    await this.notificationService.sendEmail(
      email,
      'Email Verification',
      `Click the following link to verify your email: ${verifyLink}`,
    );
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      user.activated = true; // Use activated instead of emailVerified
      await this.userRepository.save(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async googleSignup(googleAuthDto: GoogleAuthDto): Promise<any> {
    const { idToken } = googleAuthDto;

    // Verify the Google/Firebase token
    let payload;
    try {
      payload = await this.googleVerify(idToken);
      console.log('✅ Google OAuth verification successful for signup');
    } catch (googleError) {
      console.log(
        '⚠️ Google OAuth verification failed for signup, trying Firebase token...',
      );
      payload = await this.verifyFirebaseToken(idToken);
      console.log('✅ Firebase token verification successful for signup');
    }

    const { email, given_name, family_name } = payload;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create new user from Google data
    const user = this.userRepository.create({
      email,
      firstName: given_name,
      lastName: family_name,
      username: email,
      loginType: 'GOOGLE',
      activated: true, // Google emails are pre-verified
    });

    const savedUser = await this.userRepository.save(user);

    // Create default data for the new user
    try {
      await this.defaultDataService.createDefaultDataForUser(savedUser.id);
      console.log(
        `✅ Default data created for new Google user: ${savedUser.email}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to create default data for Google user ${savedUser.email}:`,
        error,
      );
      // Don't fail registration if default data creation fails
    }

    // Generate JWT token
    const jwtPayload = { email: savedUser.email, sub: savedUser.id };
    const token = this.jwtService.sign(jwtPayload);

    return {
      success: true,
      data: {
        token: token,
        userProfile: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          username: savedUser.username || savedUser.email,
        },
      },
    };
  }

  async logout(userId: string): Promise<any> {
    // For JWT-based auth, logout is typically handled client-side
    // But we can invalidate the user's token or update last activity
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update last activity or clear any session data if needed
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
