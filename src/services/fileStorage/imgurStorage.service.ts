import { FileStorage } from ".";
import { ConfigurationService } from "../configuration.service";
import { InternalServerError } from "../../utils/customErrors";
import axios, { AxiosError } from "axios";
import FormData from "form-data";


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
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new InternalServerError(`Error fetching Imgur tokens: ${JSON.stringify(err?.response?.data)}`);
      }

      throw new InternalServerError(`Error fetching Imgur tokens: ${err}`);
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
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new InternalServerError(`Error uploading to Imgur: ${JSON.stringify(err?.response?.data)}`);
      }

      throw new InternalServerError(`Error uploading to Imgur: ${err}`);
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
      if (err instanceof AxiosError) {
        throw new InternalServerError(`Error deleting image from Imgur: ${JSON.stringify(err.response?.data)}`);
      }
      throw new InternalServerError(`Error deleting from Imgur: ${err}`);
    }
  };

  async verifyToken() {
    try {
      const res = await axios.get("https://api.imgur.com/3/account/me/settings", {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

    } catch (err) {
      if (err instanceof AxiosError && err.response && err.response.status === 403) {
        await this.updateTokens();
        return;
      }
      throw new InternalServerError(`Error verifying Imgur access token: ${err}`);
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
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new InternalServerError(`Error updating Imgur tokens: ${JSON.stringify(err?.response?.data)}`);
      }

      throw new InternalServerError(`Error updating Imgur tokens: ${err}`);
    }
  }
};