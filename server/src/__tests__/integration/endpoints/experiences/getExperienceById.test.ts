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
  // Base cases: if the object isn't an object or is null, return as-is
  if (typeof obj !== 'object' || obj === null) return obj;

  // If the object is an instance of ObjectId, return its string representation
  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();

  // If the object is an array, process each item in the array
  if (Array.isArray(obj)) return obj.map(convertObjectIdToString);

  // For regular objects, process each key-value pair
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

describe("Experience creation endpoint tests", () => {
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
    console.log(`Res.body: ${JSON.stringify(res.body)}`);
    expect(res.body).toEqual(convertObjectIdToString(insertedExperience.toObject()));
  });

  it("should return a 404 code if experience with provided id doesn't exist", async () => {
    const res = await request(app).get("/experiences/653d557c56be3d6d264edda2");

    expect(res.status).toBe(404);
  });
});