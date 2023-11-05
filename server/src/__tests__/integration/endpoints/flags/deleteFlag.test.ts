import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences, createUsers, createFlags } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import { Experience } from "@shared/types/experience";
import { User } from "@shared/types/user";
import ExperienceModel from "../../../../models/experience.model";
import UserModel from "../../../../models/user.model";
import FlagModel from "../../../../models/flag.model";

let mongoServer: MongoMemoryServer;
let app: Express;
let testExperiences: Experience[];
let testUsers: User[];

describe("DELETE /flags/{flagId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);

    testUsers = await UserModel.insertMany(createUsers(5));
    testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  })
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 200 code upon success and should update the db record", async () => {
    const testFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();
    expect(testFlag._id).toBeDefined();

    const res = await request(app).delete(`/flags/${testFlag._id.toString()}`);

    expect(res.status).toBe(200);

    const retrievedFlag = await FlagModel.findById(testFlag._id);
    expect(retrievedFlag).toBeNull();
  });

  it("should return a 500 code when given an invalid ID", async () => {

    const res = await request(app).delete(`/flags/111111111111`);

    expect(res.status).toBe(500);
  });
});