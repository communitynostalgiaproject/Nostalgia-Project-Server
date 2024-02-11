import { VirusScanner } from "./virusScanner.service";
import { ImageScaler } from "./imageScaler.service";
import { FileStorage } from "./fileStorage.service";

export interface FileUploader {
  uploadFile(fileBuffer: Buffer, fileName: string): Promise<string>;
}

export class MockFileUploader implements FileUploader {
  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    return "thisisatest.com/29835309";
  };
};

export class ImageUploader implements FileUploader {
  private readonly virusScanner: VirusScanner;
  private readonly imageScaler: ImageScaler;
  private readonly fileStorage: FileStorage;
  private readonly maxWidth: number;

  constructor(virusScanner: VirusScanner, imageScaler: ImageScaler, fileStorage: FileStorage, maxWidth: number) {
    this.virusScanner = virusScanner;
    this.imageScaler = imageScaler;
    this.fileStorage = fileStorage;
    this.maxWidth = maxWidth;
  };

  uploadFile = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
    const isSafe = await this.virusScanner.scanFile(fileBuffer, fileName);
    if (!isSafe) {
      throw new Error('File is not safe');
    }

    // const scaledImage = await this.imageScaler.scaleImage(fileBuffer, this.maxWidth);
    // const fileUrl = await this.fileStorage.storeFile(scaledImage, fileName);
    const fileUrl = await this.fileStorage.storeFile(fileBuffer, fileName);
    return fileUrl;
  };
};