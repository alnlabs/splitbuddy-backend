import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  inAppNotifications: boolean;

  @Column({ default: true })
  reminders: boolean;

  @Column({ nullable: true })
  defaultGroupId: string;

  @Column({ nullable: true })
  defaultCategoryId: string;

  @Column({ nullable: true })
  defaultPaymentMethodId: string;

  @Column({ default: false })
  twoFactorAuth: boolean;

  @Column({ default: false })
  loginAlerts: boolean;

  @Column({ default: false })
  biometricLogin: boolean;

  @Column({ default: false })
  offlineMode: boolean;

  @Column({ default: false })
  cloudSync: boolean;

  @Column({ default: false })
  exportData: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
