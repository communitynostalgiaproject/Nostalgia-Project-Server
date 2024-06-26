import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin } from "../../../../utils/testUtils";
import BanModel from "../../../../models/ban.model";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;
let testUser: any;
let sessionCookie: string;

const removeMongooseDocFields: any = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item: any) => removeMongooseDocFields(item));
  }

  const newObj: any = {};
  for (let key in obj) {
    if (key !== "__v" && key !== "_id") {
      newObj[key] = removeMongooseDocFields(obj[key]);
    }
  }

  return newObj;
};

describe("POST /experiences", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = await setupApp(mongoUri);

    const loginResults = await performLogin(app);
    sessionCookie = loginResults.sessionCookie;
    testUser = loginResults.testUser;
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 201 code on success", async () => {
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Cookie", sessionCookie)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
  });


  it("should return a 400 code if invalid object was submitted", async () => {
    const testExperience = {
      title: "This shouldn't work"
    };

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Cookie", sessionCookie)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });

  it("should return a 403 code if user is banned", async () => {
    const userBan = await BanModel.create({
      userId: testUser._id,
      reason: "Test ban"
    });
    expect(userBan).toBeDefined();
    expect(userBan?.active).toBe(true);
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Cookie", sessionCookie)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(403);
  });
});