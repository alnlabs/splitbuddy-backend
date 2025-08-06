import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ name: 'default_category_id', type: 'uuid' })
  defaultCategoryId: string;

  @Column({ name: 'default_payment_method_id', type: 'uuid' })
  defaultPaymentMethodId: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config: any;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
