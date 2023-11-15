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

let mongoServer: MongoMemoryServer;
let app: Express;
let testExperiences: Experience[];
let testUsers: User[];

describe("POST /flags", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);

    testUsers = await UserModel.insertMany(createUsers(5));
    testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  })
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 200 code and copy of created record on success", async () => {
    const testFlag = createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0];

    const res = await request(app)
      .post("/flags")
      .send(testFlag)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    const {
      _id,
      __v,
      createdDate,
      ...rest
    } = res.body;
    const result = {
      ...rest,
      createdDate: new Date(createdDate)
    }
    expect(result).toEqual(testFlag);
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testFlag = {
      contentId: "This shouldn't work",
    };

    const res = await request(app)
      .post("/experiences")
      .send(testFlag)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });
});