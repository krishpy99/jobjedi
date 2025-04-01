import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  jdText!: string;

  @Column('text')
  resumeText!: string;

  @Column({ nullable: true })
  alias?: string;

  // Relationship to User removed as User model doesn't exist

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

// DTO Types
export interface ResumeCreateDTO {
  jdText: string;
  resumeText: string;
  alias?: string;
}

export interface ResumeResponseDTO {
  id: string;
  jdText: string;
  resumeText: string;
  alias?: string;
  userId: string;
  createdAt: Date;
}

export interface ResumeSearchResultDTO {
  id: string;
  jdTextExcerpt: string;
  resumeTextExcerpt: string;
  alias?: string;
  userId: string;
  similarityScore: number;
}
