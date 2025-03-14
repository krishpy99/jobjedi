# JobJedi - AI-Powered Job Application Assistant

JobJedi is a comprehensive job application assistant that helps you manage your job search, generate personalized cover letters, and get insights from your saved job descriptions using AI.

## Features

- **Chrome Extension**: Easily save job descriptions from any job posting website
- **Cover Letter Generation**: Create personalized cover letters using AI
- **Google Docs Integration**: Export cover letters to Google Docs and download as PDF
- **Job Management**: Keep track of all your job applications in one place
- **AI Assistant**: Chat with an AI assistant about your saved job descriptions

## Project Structure

The project consists of three main components:

1. **Backend**: Express.js API with MongoDB, OpenAI, and Pinecone integration
2. **Web App**: Next.js application for managing jobs and interacting with the AI
3. **Chrome Extension**: Browser extension for capturing job descriptions

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- OpenAI API key
- Pinecone account
- Google Cloud Platform account (for Google Docs integration)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/jobjedi.git
   cd jobjedi
   ```

2. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your API keys and configuration

### Backend Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Web App Setup

1. Install dependencies:
   ```
   cd web-app
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

### Chrome Extension Setup

1. Install dependencies:
   ```
   cd chrome-extension
   npm install
   ```

2. Build the extension:
   ```
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `chrome-extension/dist` directory

## Usage

1. **Adding Jobs**:
   - Navigate to a job posting website
   - Click the JobJedi extension icon
   - Click "Extract Job Info" to capture the job details
   - Click "Save Job" to store it in your database

2. **Generating Cover Letters**:
   - From the extension or web app, select a job
   - Click "Generate Cover Letter"
   - Customize if needed and export to Google Docs

3. **Using the AI Assistant**:
   - Click the chat button in the web app
   - Ask questions about your saved job descriptions
   - Get insights and advice for your applications

## Technologies Used

- **Backend**: Express.js, TypeScript, MongoDB, OpenAI API, Pinecone
- **Web App**: Next.js, React, TypeScript, Tailwind CSS
- **Chrome Extension**: React, TypeScript, Webpack

## License

This project is licensed under the MIT License - see the LICENSE file for details. 