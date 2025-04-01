import { AppDataSource } from '../db/data-source';
import { Job } from '../db/entities/Job';
import { Repository } from 'typeorm';

// Legacy interface for backward compatibility
export interface IJob {
  id: string;
  userEmail: string;
  companyName: string;
  position: string;
  jobDescription: string;
  jobUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class JobModel {
  private jobRepository: Repository<Job>;

  constructor() {
    this.jobRepository = AppDataSource.getRepository(Job);
  }

  // Get a job by userEmail and jobUrl
  async getJob(jobId: string): Promise<Job | null> {
    return this.jobRepository.findOne({
      where: {
        id: jobId
      }
    });
  }

  // Create a new job
  async createJob(job: Partial<Job>): Promise<Job> {
    const newJob = this.jobRepository.create(job);
    return this.jobRepository.save(newJob);
  }

  // Get all jobs for a user
  async getJobsByUser(userEmail: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { userEmail },
      order: { createdAt: 'DESC' }
    });
  }

  // Delete a job
  async deleteJob(jobId: string): Promise<boolean> {
    const result = await this.jobRepository.delete({
      id: jobId
    });
    
    return result.affected ? result.affected > 0 : false;
  }

  // Search jobs by text
  async searchJobs(userEmail: string, searchText: string): Promise<Job[]> {
    // Using TypeORM query builder for full-text search
    return this.jobRepository
      .createQueryBuilder('job')
      .where('job.userEmail = :userEmail', { userEmail })
      .andWhere(
        `(
          job.companyName ILIKE :searchText OR 
          job.position ILIKE :searchText OR 
          job.jobDescription ILIKE :searchText
        )`,
        { searchText: `%${searchText}%` }
      )
      .orderBy('job.createdAt', 'DESC')
      .getMany();
  }
}

export default new JobModel(); 