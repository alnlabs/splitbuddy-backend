import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("user_groups")
export class UserGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "group_name" })
  groupName: string;

  @Column()
  currency: string;

  @Column({ name: "author_id", type: "uuid" })
  authorId: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
