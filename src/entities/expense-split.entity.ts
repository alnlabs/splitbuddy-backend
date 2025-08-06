import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('expense_splits')
export class ExpenseSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expense_id', type: 'uuid' })
  expenseId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ name: 'full_name', type: 'varchar', nullable: true })
  fullName: string | null;

  @Column('numeric', { precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'share_type', type: 'varchar', nullable: true })
  shareType: string | null;

  @Column({ type: 'float', nullable: true })
  percentage: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_settled', default: false })
  isSettled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
