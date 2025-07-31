import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OAuth2Client } from 'google-auth-library';
import { NotificationService } from '../notification/notification.service';
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
  ) {
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
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: env.google.clientId,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
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

    // Generate JWT token
    const payload = { email: savedUser.email, sub: savedUser.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
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
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<any> {
    const { idToken } = googleAuthDto;

    try {
      const payload = await this.googleVerify(idToken);
      const { email, given_name, family_name } = payload;

      let user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        // Create new user from Google data
        user = this.userRepository.create({
          email,
          firstName: given_name,
          lastName: family_name,
          username: email,
          loginType: 'GOOGLE',
        });
        user = await this.userRepository.save(user);
      }

      const jwtPayload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(jwtPayload);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
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

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
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
      { expiresIn: '1h' }
    );

    const resetLink = `${env.app.corsOrigin || 'http://localhost:5900'}/api/v1/auth/reset-password?token=${token}`;

    await this.notificationService.sendEmail(
      email,
      'Password Reset Request',
      `Click the following link to reset your password: ${resetLink}`
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
    } catch (error) {
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
      { expiresIn: '24h' }
    );

    const verifyLink = `${env.app.corsOrigin || 'http://localhost:5900'}/api/v1/auth/verify-email?token=${token}`;

    await this.notificationService.sendEmail(
      email,
      'Email Verification',
      `Click the following link to verify your email: ${verifyLink}`
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
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
