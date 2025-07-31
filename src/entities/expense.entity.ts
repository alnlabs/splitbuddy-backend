import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "group_id", type: "uuid" })
  groupId: string;

  @Column("numeric", { precision: 10, scale: 2 })
  amount: number;

  @Column({ name: "category_id", type: "uuid" })
  categoryId: string;

  @Column({ name: "payment_method_id", type: "uuid" })
  paymentMethodId: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "timestamp" })
  date: Date;

  @Column({ name: "added_by", type: "uuid" })
  addedBy: string;

  @Column({ name: "author_id", type: "uuid" })
  authorId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
