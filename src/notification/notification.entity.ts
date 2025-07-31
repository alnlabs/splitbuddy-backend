import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  recipient: string; // email or userId

  @Column({ default: 'email' })
  type: string; // 'email', 'in-app', etc.

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: 'SENT' })
  status: string; // 'SENT', 'FAILED', 'READ', etc.

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
