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
import { randomBytes } from 'crypto';
import { addMinutes, isAfter } from 'date-fns';
// @ts-ignore
const env = require('../../env.js');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
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
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
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
    const resetLink = `${env.APP_URL || 'http://localhost:5900'}/api/v1/auth/reset-password?token=${token}`;
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
    const verifyLink = `${env.APP_URL || 'http://localhost:5900'}/api/v1/auth/verify-email?token=${token}`;
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
}
