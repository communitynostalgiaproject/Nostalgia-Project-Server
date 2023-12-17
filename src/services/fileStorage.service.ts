import AWS from 'aws-sdk';

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
  private s3: AWS.S3;
  private bucketName: string;

  constructor(bucketName: string, region: string) {
    AWS.config.update({ region });

    this.s3 = new AWS.S3();
    this.bucketName = bucketName;
  }

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async deleteFile(fileName: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: fileName,
    };

    await this.s3.deleteObject(params).promise();
  }
}