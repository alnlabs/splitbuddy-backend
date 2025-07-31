import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { App } from './app.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ name: 'profile_picture', type: 'bytea', nullable: true })
  profilePicture: Buffer;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'zip_code', nullable: true })
  zipCode: string;

  @Column({ name: 'social_security_number', nullable: true })
  socialSecurityNumber: string;

  @Column({ name: 'security_question', nullable: true })
  securityQuestion: string;

  @Column({ name: 'security_answer', nullable: true })
  securityAnswer: string;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_method', nullable: true })
  twoFactorMethod: string;

  @Column({ name: 'facebook_profile_url', type: 'text', nullable: true })
  facebookProfileUrl: string;

  @Column({ name: 'twitter_profile_url', type: 'text', nullable: true })
  twitterProfileUrl: string;

  @Column({ name: 'linkedin_profile_url', type: 'text', nullable: true })
  linkedinProfileUrl: string;

  @Column({ name: 'github_profile_url', type: 'text', nullable: true })
  githubProfileUrl: string;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  enabled: boolean;

  @Column({ default: false })
  locked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ unique: true, type: 'text', nullable: true })
  token: string;

  @Column({ name: 'reset_password_token', type: 'text', nullable: true })
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({
    name: 'activation_token',
    type: 'text',
    unique: true,
    nullable: true,
  })
  activationToken: string | null;

  @Column({ default: false })
  activated: boolean;

  @Column({ name: 'login_type', default: 'LOCAL' })
  loginType: string;

  @Column({ name: 'google_token', type: 'text', nullable: true })
  googleToken: string;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => App, { nullable: true })
  @JoinColumn({ name: 'app_id' })
  app: App;
}
