import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";

let mongoServer: MongoMemoryServer;
let app: Express;

const convertObjectIdToString: any = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertObjectIdToString);

  const result: { [key: string]: any } = {};
  for (let key in obj) {
    if (key === '_id' && obj[key] instanceof mongoose.Types.ObjectId) {
      result[key] = obj[key].toString();
    } else {
      result[key] = convertObjectIdToString(obj[key]);
    }
  }
  return result;
}

describe("GET /experiences/{experienceId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = setupApp(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 200 code and the requested record if found", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();

    const res = await request(app).get(`/experiences/${insertedExperience._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(convertObjectIdToString(insertedExperience.toObject()));
  });

  it("should return a 404 code if experience with provided id doesn't exist", async () => {
    const res = await request(app).get("/experiences/653d557c56be3d6d264edda2");

    expect(res.status).toBe(404);
  });
});