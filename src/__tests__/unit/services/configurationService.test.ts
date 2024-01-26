import mongoose from "mongoose";
import ConfigurationModel from "../../../models/configuration.model";  
import { ConfigurationService } from "../../../services/configuration.service";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;
let configurationService: ConfigurationService;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  configurationService = new ConfigurationService();
});

beforeEach(async () => {
  await ConfigurationModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("ConfigurationService", () => {
  describe("getConfiguration", () => {
    it("returns configuration if found", async () => {
      const testConfig = { key: "testKey", value: "testValue" };
      await new ConfigurationModel(testConfig).save();
  
      const result = await configurationService.getConfiguration("testKey");
  
      expect(result).toBeDefined();
      expect(result?.key).toBe("testKey");
      expect(result?.value).toBe("testValue");
    });
  
    it("returns undefined if configuration not found", async () => {
      const result = await configurationService.getConfiguration("nonExistingKey");
      expect(result).toBeUndefined();
    });
  });

  describe("setConfiguration", () => {
    it("creates new configuration if not exists", async () => {
      const key = "newKey";
      const value = "newValue";
  
      const result = await configurationService.setConfiguration(key, value);
  
      expect(result).toBeDefined();
      expect(result.key).toBe(key);
      expect(result.value).toBe(value);
    });
  
    it("updates existing configuration", async () => {
      const key = "existingKey";
      const value = "existingValue";
      await new ConfigurationModel({ key, value }).save();
  
      const newValue = "updatedValue";
      const updatedConfig = await configurationService.setConfiguration(key, newValue);
  
      expect(updatedConfig).toBeDefined();
      expect(updatedConfig.value).toBe(newValue);
    });
  });
  
});
