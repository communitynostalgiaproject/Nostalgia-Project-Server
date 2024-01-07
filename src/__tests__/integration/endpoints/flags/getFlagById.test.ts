import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences, createUsers, createFlags } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import { Experience } from "@projectTypes/experience";
import { User } from "@projectTypes/user";
import ExperienceModel from "../../../../models/experience.model";
import UserModel from "../../../../models/user.model";
import FlagModel from "../../../../models/flag.model";

let mongoServer: MongoMemoryServer;
let app: Express;
let testExperiences: Experience[];
let testUsers: User[];

describe("GET /flags/{flagId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);

    testUsers = await UserModel.insertMany(createUsers(5));
    testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
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

  it("should return a 200 code and the desired record on success", async () => {
    const testFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();


    const res = await request(app).get(`/flags/${testFlag._id?.toString()}`);

    expect(res.status).toBe(200);
    const resultFlag = {
      ...res.body,
      createdDate: new Date(res.body.createdDate)
    };
    const testFlagObj = {
      ...testFlag.toObject(),
      _id: res.body._id?.toString(),
      contentId: res.body.contentId.toString(),
      userId: res.body.userId.toString(),
    }
    expect(resultFlag).toEqual(testFlagObj);
  });

  it("should return a 404 code if specified object ID not found", async () => {
    const res = await request(app).post(`/flags/${testUsers[0]._id?.toString()}`);

    expect(res.status).toBe(404);
  });
});