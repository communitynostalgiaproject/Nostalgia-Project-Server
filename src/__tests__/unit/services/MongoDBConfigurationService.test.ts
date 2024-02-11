import mongoose from "mongoose";
import ConfigurationModel from "../../../models/configuration.model";  
import { MongoDBConfigurationService } from "../../../services/configuration.service";
import { MongoMemoryReplSet  } from "mongodb-memory-server";

let mongoServer: MongoMemoryReplSet;
let configurationService: MongoDBConfigurationService;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 4 } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  configurationService = new MongoDBConfigurationService();
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
  
  
  describe("setConfigurations", () => {
    it("updates multiple configurations", async () => {
      const configsToUpdate = [
        { key: "key1", value: "newValue1" },
        { key: "key2", value: "newValue2" }
      ];

      await configurationService.setConfigurations(configsToUpdate);

      const updatedConfig1 = await ConfigurationModel.findOne({ key: "key1" });
      const updatedConfig2 = await ConfigurationModel.findOne({ key: "key2" });

      expect(updatedConfig1?.value).toBe("newValue1");
      expect(updatedConfig2?.value).toBe("newValue2");
    });

    it("handles errors during batch update", async () => {
      const configsToUpdate = [
        { key: "key1", value: "newValue1" }
      ];

      // Simulate an error in bulkWrite
      jest.spyOn(ConfigurationModel, 'bulkWrite').mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(configurationService.setConfigurations(configsToUpdate))
        .rejects.toThrow("Database error");
    });

    it("does not update existing values if there is an error during transaction", async () => {
      await new ConfigurationModel({ key: "key1", value: "originalValue1" }).save();
      await new ConfigurationModel({ key: "key2", value: "originalValue2" }).save();

      jest.spyOn(ConfigurationModel, 'bulkWrite').mockImplementationOnce(async () => {
        throw new Error("Simulated transaction failure");
      });

      try {
        await configurationService.setConfigurations([
          { key: "key1", value: "newValue1" },
          { key: "key2", value: "newValue2" }
        ]);
      } catch (error) {}

      const config1 = await ConfigurationModel.findOne({ key: "key1" });
      const config2 = await ConfigurationModel.findOne({ key: "key2" });

      expect(config1?.value).toBe("originalValue1");
      expect(config2?.value).toBe("originalValue2");
    });

  });
});
