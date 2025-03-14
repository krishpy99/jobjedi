import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleDriveService {
  private oAuth2Client: OAuth2Client;
  private drive: any;
  private docs: any;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    this.oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  // Set credentials for Google API
  setCredentials(tokens: any) {
    this.oAuth2Client.setCredentials(tokens);
    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
    this.docs = google.docs({ version: 'v1', auth: this.oAuth2Client });
  }

  // Get auth URL for Google OAuth
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents',
    ];

    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  // Get tokens from code
  async getTokens(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    return tokens;
  }

  // Create a Google Doc from a template
  async createDocFromTemplate(templateId: string, title: string, replacements: Record<string, string>) {
    try {
      // Copy the template
      const copyResponse = await this.drive.files.copy({
        fileId: templateId,
        requestBody: { name: title },
      });

      const documentId = copyResponse.data.id;

      // Make text replacements
      const requests = Object.entries(replacements).map(([key, value]) => ({
        replaceAllText: {
          containsText: { text: key, matchCase: true },
          replaceText: value,
        },
      }));

      if (requests.length > 0) {
        await this.docs.documents.batchUpdate({
          documentId,
          requestBody: { requests },
        });
      }

      return documentId;
    } catch (error) {
      console.error('Error creating doc from template:', error);
      throw error;
    }
  }

  // Export Google Doc as PDF
  async exportAsPdf(documentId: string) {
    try {
      const response = await this.drive.files.export({
        fileId: documentId,
        mimeType: 'application/pdf',
      }, {
        responseType: 'arraybuffer',
      });

      // Save the PDF to Drive
      const pdfFile = await this.drive.files.create({
        requestBody: {
          name: `${documentId}_export.pdf`,
          mimeType: 'application/pdf',
        },
        media: {
          mimeType: 'application/pdf',
          body: Buffer.from(response.data),
        },
      });

      return pdfFile.data.id;
    } catch (error) {
      console.error('Error exporting document as PDF:', error);
      throw error;
    }
  }

  // Get download link for a file
  async getDownloadLink(fileId: string) {
    try {
      // Make the file publicly accessible
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const file = await this.drive.files.get({
        fileId,
        fields: 'webContentLink',
      });

      return file.data.webContentLink;
    } catch (error) {
      console.error('Error getting download link:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService(); 