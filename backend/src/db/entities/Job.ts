import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("jobs")
export class Job {
  @PrimaryColumn()
  userEmail!: string;

  @PrimaryColumn()
  jobUrl!: string;

  @Column()
  companyName!: string;

  @Column()
  position!: string;

  @Column("text")
  jobDescription!: string;

  @Column({ nullable: true })
  pineconeId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 