import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ExternalUser } from './external-user.entity';

export type LoanType = 'given' | 'taken';
export type LoanStatus =
  | 'active'
  | 'repaid'
  | 'overdue'
  | 'defaulted'
  | 'cancelled';
export type InterestType = 'simple' | 'compound' | 'none';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'loan_type', type: 'enum', enum: ['given', 'taken'] })
  loanType: LoanType;

  @Column({ name: 'lender_id', type: 'uuid', nullable: true })
  lenderId: string | null;

  @Column({ name: 'borrower_id', type: 'uuid', nullable: true })
  borrowerId: string | null;

  @Column({ name: 'external_lender_id', type: 'uuid', nullable: true })
  externalLenderId: string | null;

  @Column({ name: 'external_borrower_id', type: 'uuid', nullable: true })
  externalBorrowerId: string | null;

  @Column('numeric', { precision: 12, scale: 2 })
  principalAmount: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  interestAmount: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  remainingAmount: number;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  interestRate: number;

  @Column({
    name: 'interest_type',
    type: 'enum',
    enum: ['simple', 'compound', 'none'],
    default: 'simple',
  })
  interestType: InterestType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  repaidDate: Date | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['active', 'repaid', 'overdue', 'defaulted', 'cancelled'],
    default: 'active',
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'group_id', type: 'uuid', nullable: true })
  groupId: string;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_frequency', nullable: true })
  recurringFrequency: string; // daily, weekly, monthly, yearly

  @Column({
    name: 'recurring_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  recurringAmount: number;

  @Column({ name: 'next_payment_date', type: 'date', nullable: true })
  nextPaymentDate: Date;

  @Column({ name: 'reminder_enabled', default: true })
  reminderEnabled: boolean;

  @Column({ name: 'reminder_days', type: 'int', default: 7 })
  reminderDays: number;

  @Column({ name: 'collateral_description', type: 'text', nullable: true })
  collateralDescription: string;

  @Column({
    name: 'collateral_value',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  collateralValue: number;

  @Column({
    name: 'late_fee_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  lateFeeRate: number;

  @Column({
    name: 'late_fee_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lateFeeAmount: number;

  @Column({ name: 'documents', type: 'simple-array', nullable: true })
  documents: string[];

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lender_id' })
  lender: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'borrower_id' })
  borrower: User | null;

  @ManyToOne(() => ExternalUser, { nullable: true })
  @JoinColumn({ name: 'external_lender_id' })
  externalLender: ExternalUser | null;

  @ManyToOne(() => ExternalUser, { nullable: true })
  @JoinColumn({ name: 'external_borrower_id' })
  externalBorrower: ExternalUser | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
