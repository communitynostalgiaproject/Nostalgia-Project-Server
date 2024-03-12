import { FileStorage } from ".";
import fs from "fs/promises";
import path from "path";

export class LocalStorage implements FileStorage {
  private storageDir: string;
  private baseUrl: string;

  constructor(
    storageDir: string,
    baseUrl: string
  ) {
    this.storageDir = storageDir;
    this.baseUrl = baseUrl;
  }

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.storageDir, fileName);
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(filePath, fileBuffer);
    return `${this.baseUrl}/${encodeURIComponent(fileName)}`;
  }

  async getFileId(filePath: string): Promise<string> {
    return path.basename(filePath);
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.storageDir, fileName);

    try {
      await fs.unlink(filePath);
      console.log(`File ${fileName} deleted`)
    } catch(err: any) {
      if (err.code !== "ENOENT") throw err;
      console.log("File does not exist");
    }
  }
}
