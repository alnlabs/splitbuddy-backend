import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Loan } from './loan.entity';
import { LoanPayment } from './loan-payment.entity';

@Entity('external_users')
export class ExternalUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

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

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'relationship_type', nullable: true })
  relationshipType: string; // friend, family, colleague, business, other

  @Column({ name: 'contact_preference', nullable: true })
  contactPreference: string; // email, phone, sms, in_person

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string; // Internal user who created this external user

  @Column({ name: 'reference_email', nullable: true })
  referenceEmail: string; // Email of the internal user who created this external user

  @Column({ name: 'migrated_to_user_id', type: 'uuid', nullable: true })
  migratedToUserId: string | null; // Reference to user table when migrated

  @Column({ name: 'migrated_at', type: 'timestamp', nullable: true })
  migratedAt: Date | null;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Loan, (loan) => loan.externalLender)
  loansAsLender: Loan[];

  @OneToMany(() => Loan, (loan) => loan.externalBorrower)
  loansAsBorrower: Loan[];

  @OneToMany(() => LoanPayment, (payment) => payment.externalPayer)
  paymentsAsPayer: LoanPayment[];

  @OneToMany(() => LoanPayment, (payment) => payment.externalPayee)
  paymentsAsPayee: LoanPayment[];
}
