import { ResumeResponseDTO, ResumeSearchResultDTO } from '../models/resume.model';
import * as natural from 'natural';
import { PorterStemmer } from 'natural/lib/natural/stemmers';

export class TFIDFService {
  private tokenizer: natural.WordTokenizer;
  private stemmer: typeof PorterStemmer;
  private stopWords: Set<string>;

  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = PorterStemmer;
    
    // Common English stop words
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
      'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);
  }

  private preprocessText(text: string): string[] {
    // Convert to lowercase and remove non-alphanumeric characters
    const cleanedText = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, ' ');
    
    // Tokenize
    const tokens = this.tokenizer.tokenize(cleanedText) || [];
    
    // Remove stop words and apply stemming
    return tokens
      .filter((token: string) => !this.stopWords.has(token))
      .map((token: string) => this.stemmer.stem(token));
  }

  private getExcerpt(text: string, maxLength = 200): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  public searchResumes(query: string, resumes: ResumeResponseDTO[]): ResumeSearchResultDTO[] {
    if (!resumes.length) {
      return [];
    }

    // Initialize TF-IDF
    const tfidf = new natural.TfIdf();
    
    // Add preprocessed query
    const preprocessedQuery = this.preprocessText(query).join(' ');
    tfidf.addDocument(preprocessedQuery);
    
    // Add preprocessed job descriptions
    resumes.forEach(resume => {
      const preprocessedJd = this.preprocessText(resume.jdText).join(' ');
      tfidf.addDocument(preprocessedJd);
    });
    
    // Calculate similarities
    const results: ResumeSearchResultDTO[] = [];
    
    resumes.forEach((resume, index) => {
      // Calculate similarity score (using cosine similarity)
      let similarityScore = 0;
      
      // The query is the first document (index 0)
      // Each resume JD is at index+1
      tfidf.tfidfs(preprocessedQuery, (i: number, measure: number) => {
        if (i === index + 1) {
          similarityScore = measure;
        }
      });
      
      // Normalize similarity score to 0-1 range
      // This is a simple normalization, more sophisticated methods could be used
      const normalizedScore = Math.min(Math.max(similarityScore / 10, 0), 1);
      
      results.push({
        id: resume.id,
        userId: resume.userId,
        jdTextExcerpt: this.getExcerpt(resume.jdText),
        resumeTextExcerpt: this.getExcerpt(resume.resumeText),
        alias: resume.alias,
        similarityScore: normalizedScore
      });
    });
    
    // Sort by similarity score in descending order
    return results.sort((a, b) => b.similarityScore - a.similarityScore);
  }
}

export const tfidfService = new TFIDFService();
