-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  user_email VARCHAR(255) NOT NULL,
  job_url VARCHAR(512) NOT NULL,
  company_name VARCHAR(255),
  position VARCHAR(255),
  job_description TEXT,
  embeddings REAL[] DEFAULT NULL,  -- Store embeddings as an array of real numbers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Composite primary key
  PRIMARY KEY (user_email, job_url)
);

-- Add indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_jobs_company_name ON jobs(company_name);
CREATE INDEX IF NOT EXISTS idx_jobs_position ON jobs(position);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- Add full-text search capabilities
-- Create a tsvector column for full-text search
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ts_search_vector TSVECTOR;

-- Create a function to automatically update the tsvector column
CREATE OR REPLACE FUNCTION jobs_update_ts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ts_search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.position, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.job_description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the tsvector column
CREATE TRIGGER jobs_update_trigger
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION jobs_update_ts_search_vector();

-- Create a GIN index for the tsvector column for fast full-text searches
CREATE INDEX IF NOT EXISTS idx_jobs_ts_search_vector ON jobs USING GIN(ts_search_vector); 