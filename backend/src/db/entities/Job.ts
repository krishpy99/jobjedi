import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

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

  @Column("jsonb", { nullable: true })
  embeddings?: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Add a full-text search index
  @Index("idx_jobs_search", { synchronize: false })
  searchVector?: string;
} 