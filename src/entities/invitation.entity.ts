import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("invitations")
export class Invitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "sender_id", type: "uuid" })
  senderId: string;

  @Column({ name: "recipient_email" })
  recipientEmail: string;

  @Column({ name: "group_id", type: "uuid" })
  groupId: string;

  @Column({ default: "PENDING" })
  status: string;

  @Column({ type: "uuid", unique: true })
  token: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
