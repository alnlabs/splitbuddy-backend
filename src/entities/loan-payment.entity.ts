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
import { Loan } from './loan.entity';
import { ExternalUser } from './external-user.entity';

export type PaymentType = 'principal' | 'interest' | 'late_fee' | 'partial';

@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'loan_id', type: 'uuid' })
  loanId: string;

  @Column({ name: 'payer_id', type: 'uuid', nullable: true })
  payerId: string | null;

  @Column({ name: 'payee_id', type: 'uuid', nullable: true })
  payeeId: string | null;

  @Column({ name: 'external_payer_id', type: 'uuid', nullable: true })
  externalPayerId: string | null;

  @Column({ name: 'external_payee_id', type: 'uuid', nullable: true })
  externalPayeeId: string | null;

  @Column('numeric', { precision: 12, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: ['principal', 'interest', 'late_fee', 'partial'],
    default: 'partial',
  })
  paymentType: PaymentType;

  @Column({
    name: 'principal_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  principalAmount: number;

  @Column({
    name: 'interest_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  interestAmount: number;

  @Column({
    name: 'late_fee_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lateFeeAmount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Loan, { nullable: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'payer_id' })
  payer: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'payee_id' })
  payee: User | null;

  @ManyToOne(() => ExternalUser, { nullable: true })
  @JoinColumn({ name: 'external_payer_id' })
  externalPayer: ExternalUser | null;

  @ManyToOne(() => ExternalUser, { nullable: true })
  @JoinColumn({ name: 'external_payee_id' })
  externalPayee: ExternalUser | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User;
}
