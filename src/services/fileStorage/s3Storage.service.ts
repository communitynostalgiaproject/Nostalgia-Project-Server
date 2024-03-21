import { FileStorage } from ".";
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from "@aws-sdk/client-s3";

export class S3StorageService implements FileStorage {
  private bucketName: string;
  private s3Client: S3Client;

  constructor(bucketName: string, region: string) {
    this.s3Client = new S3Client({ region });
    this.bucketName = bucketName;
  };

  async storeFile(fileBuffer: Buffer, fileId: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileId,
      Body: fileBuffer
    } as PutObjectCommandInput;
    await this.s3Client.send(new PutObjectCommand(params));
    return `https://${this.bucketName}.s3.amazonaws.com/${fileId}`;
  };

  async getFileId(fileUrl: string): Promise<string> {
    return `${fileUrl.split("/").pop()}`;
  };

  async deleteFile(fileId: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileId,
    } as DeleteObjectCommandInput;

    await this.s3Client.send(new DeleteObjectCommand(params));
  };
}