-- Create cover_letters table (for future implementation)
CREATE TABLE IF NOT EXISTS cover_letters (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  job_url VARCHAR(512) NOT NULL,
  content TEXT NOT NULL,
  google_docs_id VARCHAR(255),
  google_drive_pdf_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Add foreign key to jobs table
  FOREIGN KEY (user_email, job_url) REFERENCES jobs(user_email, job_url) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_email ON cover_letters(user_email);
CREATE INDEX IF NOT EXISTS idx_cover_letters_job_url ON cover_letters(job_url); 