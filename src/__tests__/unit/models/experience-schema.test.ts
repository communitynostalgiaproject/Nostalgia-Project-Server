import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import ExperienceModel from "../../../models/experience.model";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createExperiences } from "../../../utils/testDataGen";
import { create } from "domain";

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
    const experience = new ExperienceModel(createExperiences(1)[0]);
    try {
      const savedExperience = await experience.save();
      expect(savedExperience._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

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
