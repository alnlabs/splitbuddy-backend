import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'expense' })
  type:
    | 'income'
    | 'loan_given'
    | 'loan_taken'
    | 'chit_investment'
    | 'gold'
    | 'asset_loan'
    | 'expense';

  @Column('numeric', { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  counterparty: string; // For loans (name or userId)

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  interestRate: number; // For loans

  @Column({ nullable: true })
  assetType: string; // For gold, asset loans

  @Column({ nullable: true })
  groupId: string; // For family/personal distinction

  @Column({ nullable: true })
  status: string; // active, closed, repaid, etc.

  @Column({ nullable: false })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
