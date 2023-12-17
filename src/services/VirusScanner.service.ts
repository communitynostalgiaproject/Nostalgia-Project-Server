import axios from "axios";
import FormData from "form-data";

export interface VirusScanner {
  scanFile(fileBuffer: Buffer, fileName: String): Promise<boolean>;
}

export class MockVirusScanner implements VirusScanner {
  scanFile = async (fileBuffer: Buffer, fileName: string): Promise<boolean> => {
    return true;
  }
}

export class VirusTotalScanner implements VirusScanner {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  scanFile = async (fileBuffer: Buffer, fileName: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);

      const response = await axios.post('https://www.virustotal.com/api/v3/files', formData, {
        headers: {
          ...formData.getHeaders(),
          'x-apikey': this.apiKey,
        },
      });

      const isSafe = await this.checkAnalysis(response.data.data.links.self);
      return isSafe;
    } catch (error) {
      console.error('Error scanning file:', error);
      throw new Error('File scan failed');
    }
  }

  private checkAnalysis = async (analysisCheckURL: string): Promise<boolean> => {
    try {
      const response = await axios.get(analysisCheckURL, {
        headers: {
          'x-apikey': this.apiKey,
        },
      });

      const stats = response.data.data.attributes.stats;
      const isSafe = stats.malicious === 0 && stats.suspicious === 0;
      
      return isSafe;
    } catch (error) {
      console.error('Error checking analysis:', error);
      throw new Error('File scan failed');
    }
  } 
}