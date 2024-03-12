export interface FileStorage {
  storeFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  getFileId(filePath: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
};

export { MockFileStorage } from "./mockFileStorage.service";
export { S3StorageService } from "./s3Storage.service";
export { ImgurStorageService } from "./imgurStorage.service";