import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createReactions } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin } from "../../../../utils/testUtils";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;
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

describe("POST /reactions", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = setupApp(mongoUri);

    const loginResults = await performLogin(app);
    sessionCookie = loginResults.sessionCookie;
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testReaction = createReactions(1)[0];

    const res = await request(app)
      .post("/reactions")
      .send(testReaction)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 201 code on success", async () => {
    const testReaction = createReactions(1)[0];

    const res = await request(app)
      .post("/reactions")
      .send(testReaction)
      .set("Content-Type", "application/json")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(201);
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testReaction = {
      reaction: "whatever"
    };

    const res = await request(app)
      .post("/reactions")
      .send(testReaction)
      .set("Content-Type", "application/json")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(400);
  });
});