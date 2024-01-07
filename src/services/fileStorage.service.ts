import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from "@aws-sdk/client-s3";

export interface FileStorage {
  storeFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

export class MockFileStorage implements FileStorage {
  storeFile = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
    return `https://mockstorage.com/${fileName}`;
  }

  deleteFile = async (fileName: string): Promise<void> => {
    return;
  }
}

export class S3StorageService implements FileStorage {
  private bucketName: string;
  private s3Client: S3Client;

  constructor(bucketName: string, region: string) {
    this.s3Client = new S3Client({ region });
    this.bucketName = bucketName;
  }

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer
    } as PutObjectCommandInput;
    await this.s3Client.send(new PutObjectCommand(params));
    return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    } as DeleteObjectCommandInput;

    await this.s3Client.send(new DeleteObjectCommand(params));
  }
}