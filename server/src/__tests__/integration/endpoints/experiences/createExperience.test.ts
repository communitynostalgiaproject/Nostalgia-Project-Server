import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;

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
}

describe("Experience creation endpoint tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 200 code and copy of created record on success", async () => {
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(removeMongooseDocFields(res.body)).toEqual(testExperience);
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testExperience = {
      title: "This shouldn't work"
    };

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });
});