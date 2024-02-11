import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from "@aws-sdk/client-s3";
import axios, { AxiosError} from "axios";
import FormData from "form-data";
import { ConfigurationService } from "./configuration.service";

export interface FileStorage {
  storeFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  getFileId(filePath: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
};

export class MockFileStorage implements FileStorage {
  storeFile = async (fileBuffer: Buffer, fileId: string): Promise<string> => {
    return `https://mockstorage.com/${fileId}`;
  };

  getFileId = async (filePath: string): Promise<string> => {
    return "mockId";
  };

  deleteFile = async (fileName: string): Promise<void> => {
    return;
  };
};

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

export class ImgurStorageService implements FileStorage {
  private accessToken: string;
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private configService: ConfigurationService;

  constructor(
    accessToken: string,
    refreshToken: string,
    clientId: string,
    clientSecret: string,
    configService: ConfigurationService
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.configService = configService;
  };

  static async fetchTokens(configService: ConfigurationService): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await configService.getConfiguration('IMGUR_ACCESS_TOKEN');
      const refreshToken = await configService.getConfiguration('IMGUR_REFRESH_TOKEN');

      if (!accessToken) {
        throw Error("IMGUR_ACCESS_TOKEN configuration not set");
      }
      if (!refreshToken) {
        throw Error("IMGUR_REFRESH_TOKEN configuration not set");
      }
  
      return { accessToken: accessToken.value, refreshToken: refreshToken.value };
    } catch(err) {
      if (err instanceof AxiosError) {
        console.error(`Error fetching Imgur tokens: ${err.message}`);
      }
      console.error(`Error fetching Imgur tokens: ${err}`);
      throw err;
    }
  };

  async storeFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      await this.verifyToken();
      const formData = new FormData();
      formData.append("image", fileBuffer, fileName);

      console.log(`Uploading file: ${fileName}, Size: ${fileBuffer.length} bytes`);
      const response = await axios.post("https://api.imgur.com/3/image", formData, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity
      });

      return response.data.data.link; // URL of the uploaded image
    } catch (error) {
      console.error("Error uploading to Imgur:", error);
      throw new Error("Failed to upload image to Imgur");
    }
  };

  async getFileId(fileUrl: string): Promise<string> {
    return `${fileUrl.split("/").pop()}`;
  };

  async deleteFile(imageHash: string): Promise<void> {
    try {
      await this.verifyToken();
      await axios.delete(`https://api.imgur.com/3/image/${imageHash}`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });
    } catch (err) {
      console.error("Error deleting from Imgur:", err);
      throw err;
    }
  };

  async verifyToken() {
    try {
      const res = await axios.get("https://api.imgur.com/3/account/me/settings", {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

    } catch(err) {
      if (err instanceof AxiosError && err.response && err.response.status === 403) {
        await this.updateTokens();
        return;
      }
      console.error(`Error verifying Imgur access token: ${err}`);
      throw err;
    }
  };

  async updateTokens() {
    console.log("Updating Imgur tokens");
    try {
      var data = new FormData();
      data.append("refresh_token", this.refreshToken);
      data.append("client_id", this.clientId);
      data.append("client_secret", this.clientSecret);
      data.append("grant_type", "refresh_token"); 

      const res = await axios.post(
        "https://api.imgur.com/oauth2/token", 
        data,
        {
          headers: {
            ...data.getHeaders()
          }
        }
      );

      const { access_token, refresh_token } = res.data;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      await this.configService.setConfigurations([
        {
          key: "IMGUR_ACCESS_TOKEN",
          value: access_token
        },
        {
          key: "IMGUR_REFRESH_TOKEN",
          value: refresh_token
        }
      ]);
    } catch(err) {
      console.error(`Unable to update Imgur tokens: ${err}`);
      throw err;
    }
  }
};