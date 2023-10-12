import mongoose from "mongoose";
import ExperienceModel from "../models/experience.model";
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
});

describe('Experience Model Test', () => {
  it('should save a new experience successfully', async () => {
    const experience = new ExperienceModel({
      title: "Test title",
      place: {
        address: { someProperty: "value" },
        location: {
          type: "Point",
          coordinates: [125.6, 10.1]
        }
      },
      description: "Test description",
      experienceDate: "2023-10-12"
    });
    try {
      const savedExperience = await experience.save();
      expect(savedExperience._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  }, 10000);

  it('should fail to save an experience without required fields', async () => {
    const experience = new ExperienceModel({
      title: "Test title"
    });
    await expect(experience.save()).rejects.toThrowError(mongoose.Error.ValidationError);
  });

  it('should fail to save an experience with an invalid date string', async () => {
    const experience = new ExperienceModel({
      title: "Test title",
      place: {
        address: { someProperty: "value" }, // add mock PeliasGeoJSONProperties data
        location: {
          type: "Point",
          coordinates: [125.6, 10.1]
        }
      },
      description: "Test description",
      experienceDate: "invalid-date-string"
    });
    await expect(experience.save()).rejects.toThrowError("invalid-date-string is not a valid date string");
  });
});
