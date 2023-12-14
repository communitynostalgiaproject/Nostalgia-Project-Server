import AWS from 'aws-sdk';

export interface FileStorage {
  storeFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  getFileUrl(fileName: string): Promise<string>;
  deleteFile(fileName: string): Promise<void>;
}

export class S3StorageService implements FileStorage {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(bucketName: string, region: string, accessKeyId: string, secretAccessKey: string) {
    AWS.config.update({
      region,
      accessKeyId,
      secretAccessKey,
    });

    this.s3 = new AWS.S3();
    this.bucketName = bucketName;
  }

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ACL: 'public-read',
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async getFileUrl(fileName: string): Promise<string> {
    // This presumes the S3 bucket is public. If not, generate a signed URL instead.
    const url = `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
    return url;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    await this.s3.deleteObject(params).promise();
  }
}