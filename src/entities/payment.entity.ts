import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "payer_id", type: "uuid" })
  payerId: string;

  @Column({ name: "payee_id", type: "uuid" })
  payeeId: string;

  @Column("numeric", { precision: 10, scale: 2 })
  amount: number;

  @Column({ name: "group_id", type: "uuid" })
  groupId: string;

  @Column({ name: "payment_method", type: "varchar", nullable: true })
  paymentMethod: string | null;

  @Column({ name: "author_id", type: "uuid" })
  authorId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
