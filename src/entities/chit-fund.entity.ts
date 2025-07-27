import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ChitFundType =
  | 'registered'
  | 'unregistered'
  | 'company'
  | 'government'
  | 'online'
  | 'auction'
  | 'lottery'
  | 'fixed';

@Entity('chit_funds')
export class ChitFund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: ChitFundType;

  @Column('simple-array')
  members: string[];

  @Column('numeric', { precision: 12, scale: 2 })
  amount: number;

  @Column('int')
  duration: number;

  @Column('numeric', { precision: 12, scale: 2 })
  monthlyContribution: number;

  @Column({ type: 'varchar', nullable: true })
  biddingType: 'auction' | 'lottery' | 'fixed';

  @Column({ nullable: true })
  foreman: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ default: false })
  isRegistered: boolean;

  @Column({ default: false })
  isGovernment: boolean;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ nullable: true })
  appName: string;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  commission: number;

  @Column('simple-array', { nullable: true })
  payoutOrder: string[];

  @Column({ nullable: true })
  status: string;

  // --- Added fields to match frontend ---
  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  ownerName: string;

  @Column({ nullable: true })
  governmentBody: string;

  @Column({ nullable: true })
  auctionRules: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDate: Date;

  @Column({ nullable: true })
  reminder: boolean;

  @Column({ type: 'int', nullable: true })
  reminderDays: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  documents: string[];

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  interestRate: number;

  @Column('numeric', { precision: 5, scale: 2, nullable: true })
  penalty: number;

  @Column({ type: 'int', nullable: true })
  maxMembers: number;

  @Column({ type: 'int', nullable: true })
  minMembers: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastPaymentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextDrawDate: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
