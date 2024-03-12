import {
  FileStorage,
  LocalStorage,
  S3StorageService,
  ImgurStorageService,
} from "./fileStorage";
import { ConfigurationService } from "./configuration.service";
import { VirusScanner, VirusTotalScanner } from "./virusScanner.service";
import { ImageScaler, SharpImageScaler } from "./imageScaler.service";
import { FileUploader, ImageUploader } from "./fileUploader.service";

abstract class ServiceFactory<T> {
  abstract create(...args: any[]): Promise<T>;
};

export class LocalStorageFactory extends ServiceFactory<FileStorage> {
  async create(storageDir: string, baseUrl: string): Promise<FileStorage> {
    return new LocalStorage(storageDir, baseUrl);
  }
}

export class S3StorageFactory extends ServiceFactory<FileStorage> {
  async create(bucketName: string, region: string): Promise<FileStorage> {
    return new S3StorageService(bucketName, region);
  };
};

export class ImgurStorageFactory extends ServiceFactory<FileStorage> {
  async create(configService: ConfigurationService): Promise<FileStorage> {
    const { accessToken, refreshToken } = await ImgurStorageService.fetchTokens(configService);
    return new ImgurStorageService(
      accessToken,
      refreshToken,
      `${process.env.IMGUR_CLIENT_ID}`,
      `${process.env.IMGUR_CLIENT_SECRET}`,
      configService
    );
  };
};

export class VirusTotalScannerFactory extends ServiceFactory<VirusScanner> {
  async create(): Promise<VirusScanner> {
    return new VirusTotalScanner(`${process.env.VIRUS_TOTAL_API_STRING}`);
  };
};

export class SharpImageScalerFactory extends ServiceFactory<ImageScaler> {
  async create(): Promise<ImageScaler> {
    return new SharpImageScaler();
  };
};

export class ImageUploaderFactory extends ServiceFactory<FileUploader> {
  async create(
    virusScanner: VirusScanner,
    imageScaler: ImageScaler,
    storageService: FileStorage,
    maxWidth: number
  ): Promise<FileUploader> {
    return new ImageUploader(
      virusScanner,
      imageScaler,
      storageService,
      maxWidth
    );
  };
}