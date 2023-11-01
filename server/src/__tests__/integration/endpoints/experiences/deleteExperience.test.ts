import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("DELETE /experiences/{experienceId}", () => {
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

  it("should return a 200 code upon success and should delete the db record", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();

    const res = await request(app).delete(`/experiences/${insertedExperience._id}`);

    expect(res.status).toBe(200);
    
    const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
    expect(retrievedExperience).toBeNull();
  });

  it("should return a 500 code if given an invalid ID", async () => {
    const res = await request(app).delete(`/experiences/1234`);

    expect(res.status).toBe(500);
  });
});