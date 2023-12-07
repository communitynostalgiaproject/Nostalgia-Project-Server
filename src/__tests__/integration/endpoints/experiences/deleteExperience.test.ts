import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";

let mongoServer: MongoMemoryServer;
let app: Express;
let sessionCookie: string;
let testUser: any;

describe("DELETE /experiences/{experienceId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = setupApp(uri);

    const authRes = await request(app).get("/auth/mock");
    sessionCookie = authRes
      .headers["set-cookie"][0]
      .split(";")[0]
      .trim();
    testUser = authRes.body.user;
    console.log(`testUser: ${JSON.stringify(testUser)}`);
    console.log(`sessionCookie: ${sessionCookie}`);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();

    const res = await request(app).delete(`/experiences/${insertedExperience._id}`);

    expect(res.status).toBe(401);
  });

  it("should return a 403 code if user does not have permission", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();

    expect(insertedExperience._id).not.toBe(testUser._id);

    const res = await request(app)
      .delete(`/experiences/${insertedExperience._id}`)
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(403);
  });

  it("should return a 200 code upon success and should delete the db record", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel({
      ...testExperience,
      creatorId: testUser._id
    }).save();

    const res = await request(app)
      .delete(`/experiences/${insertedExperience._id}`)
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    
    const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
    expect(retrievedExperience).toBeNull();
  });

  it("should return a 400 code if given an invalid ID", async () => {
    const res = await request(app)
      .delete(`/experiences/1234`)
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(400);
  });
});