import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";
import { faker } from "@faker-js/faker";

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

  it("should return a 200 code upon success and should update the db record", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();
    const updatedExperience = {
      ...insertedExperience.toObject(),
      description: "This description has been updated."
    };

    const res = await request(app).patch(`/experiences`).send(updatedExperience);

    expect(res.status).toBe(200);
    
    const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
    expect(retrievedExperience?.toObject()).toEqual(updatedExperience);
  });

  it("should return a 500 code when attempting to update a record with an invalid id", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();
    const updatedExperience = {
      ...insertedExperience.toObject(),
      _id: "111111111111",
      description: "This description has been updated."
    };

    const res = await request(app).patch(`/experiences`).send(updatedExperience);

    expect(res.status).toBe(500);
  });
});