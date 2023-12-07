import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;
let sessionCookie: string;

<<<<<<< HEAD
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

=======
>>>>>>> development
describe("POST /experiences", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = setupApp(mongoUri);

    const authRes = await request(app).get("/auth/mock");
    sessionCookie = authRes
      .headers["set-cookie"][0]
      .split(";")[0]
      .trim();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

<<<<<<< HEAD
  it("should return a 401 code if user is not logged in", async () => {
    const testExperience = createExperiences(1)[0];
=======
  it("should return a 200 code and copy of created record on success", async () => {
    const testExperience: any = createExperiences(1)[0];
>>>>>>> development

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 200 code on success", async () => {
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testExperience = {
      title: "This shouldn't work"
    };

    const res = await request(app)
      .post("/experiences")
      .send(testExperience)
      .set("Content-Type", "application/json")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(400);
  });
});