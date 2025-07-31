import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("apps")
export class App {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "app_name", unique: true })
  appName: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
