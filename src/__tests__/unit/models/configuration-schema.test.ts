import mongoose from "mongoose";
import ConfigurationModel from "../../../models/configuration.model";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
})

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    mongoServer.stop();
  }
});

describe('Experience Model Test', () => {
  it('should save a new experience successfully', async () => {
    const config = new ConfigurationModel({
      key: "Test",
      value: "1234"
    });
    try {
      const savedConfig = await config.save();
      expect(savedConfig._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it('sets the createdAt and updatedAt fields', async () => {
    const config = new ConfigurationModel({
      key: "Test",
      value: "1234"
    });
    try {
      const savedConfig = await config.save();
      expect(savedConfig._id).toBeDefined();
      expect(savedConfig.createdAt).toBeDefined();
      expect(savedConfig.updatedAt).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });
});
