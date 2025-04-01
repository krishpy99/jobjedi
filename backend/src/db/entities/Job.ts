import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column()
  userEmail!: string;

  @Column()
  jobUrl!: string;

  @Column()
  companyName!: string;

  @Column()
  position!: string;

  @Column("text")
  jobDescription!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 