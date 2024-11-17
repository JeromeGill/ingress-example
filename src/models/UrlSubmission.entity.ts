import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class UrlSubmission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  status: string;
}
