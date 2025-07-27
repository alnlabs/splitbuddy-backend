import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { DefaultDataService } from '../services/default-data.service';
import { randomBytes } from 'crypto';
import { addMinutes, isAfter } from 'date-fns';
// Environment variables are loaded via dotenv in main.ts
import {
  GoogleSignupDto,
  GoogleLoginDto,
  GoogleVerifyDto,
} from './google-auth.dto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly defaultDataService: DefaultDataService,
  ) {}

  async register(dto: any): Promise<any> {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      middleName,
      dateOfBirth,
      gender,
      nationality,
      address,
      city,
      state,
      country,
      zipCode,
      facebookProfileUrl,
      twitterProfileUrl,
      linkedinProfileUrl,
      githubProfileUrl,
      websiteUrl,
    } = dto;
    const existing = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      middleName,
      dateOfBirth,
      gender,
      nationality,
      address,
      city,
      state,
      country,
      zipCode,
      facebookProfileUrl,
      twitterProfileUrl,
      linkedinProfileUrl,
      githubProfileUrl,
      websiteUrl,
      enabled: true,
      activated: true,
    });
    await this.userRepository.save(user);
    await this.defaultDataService.createDefaultDataForUser(user.id);
    const { password: pw, ...profile } = user;
    // Send welcome email and in-app notification
    const welcomeSubject = 'Welcome to SplitBuddy!';
    const welcomeText = `Hi ${user.firstName || user.username},\n\nWelcome to SplitBuddy! Your account has been created.`;
    const welcomeHtml = `<p>Hi <b>${user.firstName || user.username}</b>,</p><p>Welcome to SplitBuddy! Your account has been created.</p>`;
    try {
      await this.notificationService.sendEmail(
        user.email,
        welcomeSubject,
        welcomeText,
        welcomeHtml,
      );
    } catch (e) {}
    try {
      await this.notificationService.sendInApp(
        user.id,
        'Welcome to SplitBuddy! Your account has been created.',
      );
    } catch (e) {}
    return profile;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ token: string; userProfile: any }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const { password: pw, ...profile } = user;
    return {
      token: this.jwtService.sign({ sub: user.id, username: user.username }),
      userProfile: profile,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Omit sensitive fields like password
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    for (const key of Object.keys(dto)) {
      if (key !== 'password' && key in user) {
        (user as any)[key] = dto[key];
      }
    }
    await this.userRepository.save(user);
    const { password, ...profile } = user;
    return profile;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      return { message: 'If the email exists, a reset link has been sent.' };
    const token = randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = addMinutes(new Date(), 30); // 30 min expiry
    await this.userRepository.save(user);
    const resetLink = `${process.env.APP_URL || 'http://localhost:5900'}/api/v1/auth/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const text = `Reset your password: ${resetLink}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    await this.notificationService.sendEmail(user.email, subject, text, html);
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
    if (
      !user ||
      !user.resetPasswordExpires ||
      isAfter(new Date(), user.resetPasswordExpires)
    ) {
      throw new BadRequestException('Invalid or expired token');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.userRepository.save(user);
    return { message: 'Password has been reset successfully' };
  }

  async requestEmailVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      return {
        message: 'If the email exists, a verification link has been sent.',
      };
    const token = randomBytes(32).toString('hex');
    user.activationToken = token;
    await this.userRepository.save(user);
    const verifyLink = `${process.env.APP_URL || 'http://localhost:5900'}/api/v1/auth/verify-email?token=${token}`;
    const subject = 'Verify Your Email';
    const text = `Verify your email: ${verifyLink}`;
    const html = `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`;
    await this.notificationService.sendEmail(user.email, subject, text, html);
    return {
      message: 'If the email exists, a verification link has been sent.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { activationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');
    user.activated = true;
    user.activationToken = null;
    await this.userRepository.save(user);
    return { message: 'Email verified successfully' };
  }

  async googleSignup(dto: GoogleSignupDto) {
    console.log('[AuthService] googleSignup called with dto:', dto);

    const payload = await verifyGoogleToken(dto.idToken);
    console.log('[AuthService] googleSignup payload:', payload);

    if (!payload?.email)
      throw new UnauthorizedException('Invalid Google token');

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (user) throw new BadRequestException('User already exists');

    // Create user
    user = this.userRepository.create({
      email: payload.email,
      firstName: dto.firstName || payload.given_name,
      lastName: dto.lastName || payload.family_name,
      username: payload.email,
      loginType: 'GOOGLE',
      googleToken: dto.idToken,
      enabled: true,
      activated: true,
    });
    console.log('[AuthService] googleSignup creating user:', user);
    await this.userRepository.save(user);
    await this.defaultDataService.createDefaultDataForUser(user.id);
    console.log('[AuthService] googleSignup user saved successfully');

    const result = this.loginWithUser(user);
    console.log('[AuthService] googleSignup returning result:', result);
    return result;
  }

  async googleLogin(dto: GoogleLoginDto) {
    const payload = await verifyGoogleToken(dto.idToken);
    if (!payload?.email)
      throw new UnauthorizedException('Invalid Google token');

    // Find user
    const user = await this.userRepository.findOne({
      where: { email: payload.email, loginType: 'GOOGLE' },
    });
    if (!user)
      throw new UnauthorizedException('User not found, please sign up first');
    return this.loginWithUser(user);
  }

  async googleVerify(idToken: string) {
    console.log(
      '[AuthService] googleVerify called with idToken:',
      idToken ? idToken.substring(0, 12) + '...' : 'undefined',
    );
    try {
      const payload = await verifyGoogleToken(idToken);
      console.log('[AuthService] googleVerify payload:', payload);
      if (!payload?.email)
        throw new UnauthorizedException('Invalid Google token');
      return { email: payload.email, name: payload.name };
    } catch (err) {
      console.error('[AuthService] googleVerify error:', err);
      throw err;
    }
  }

  async logout(userId: string) {
    console.log('[AuthService] logout called for userId:', userId);
    // For JWT-based authentication, logout is typically handled client-side
    // by removing the token. The server doesn't need to do anything special.
    // However, you could implement token blacklisting here if needed.
    return { message: 'Logout successful' };
  }

  private loginWithUser(user: User) {
    const { password, ...profile } = user;
    return {
      token: this.jwtService.sign({ sub: user.id, email: user.email }),
      userProfile: profile,
    };
  }

  async createDefaultData(userId: string) {
    try {
      console.log(`[AuthService] Creating default data for user: ${userId}`);
      const result =
        await this.defaultDataService.createDefaultDataForUser(userId);
      console.log(
        `[AuthService] Default data created successfully for user: ${userId}`,
      );
      return {
        message: 'Default data created successfully',
        data: result,
      };
    } catch (error) {
      console.error(
        `[AuthService] Error creating default data for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async checkDefaultDataStatus(userId: string) {
    try {
      console.log(
        `[AuthService] Checking default data status for user: ${userId}`,
      );

      const result =
        await this.defaultDataService.checkDefaultDataStatus(userId);

      console.log(
        `[AuthService] Default data status for user ${userId}:`,
        result,
      );

      return result;
    } catch (error) {
      console.error(
        `[AuthService] Error checking default data status for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
