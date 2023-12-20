import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin } from "../../../../utils/testUtils";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let mongoServer: MongoMemoryServer;
let app: Express;
let sessionCookie: string;
let testFoodPhotoBuffer: Buffer;
let testPersonPhotoBuffer: Buffer;

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
    app = setupApp(mongoUri);

    const loginResults = await performLogin(app);
    sessionCookie = loginResults.sessionCookie;

    testFoodPhotoBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "..", "assets", "testFoodPhoto.png"));
    testPersonPhotoBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "..", "assets", "testPersonPhoto.jpg"));
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
      .field("experience", JSON.stringify(testExperience))
      .attach("foodPhoto", testFoodPhotoBuffer, "testFoodPhoto.png")
      .attach("personPhoto", testPersonPhotoBuffer, "testPersonPhoto.jpg")
      .set("Content-Type", "multipart/form-data");

    expect(res.status).toBe(401);
  });

  it("should return a 201 code on success", async () => {
    const testExperience = createExperiences(1)[0];

    const res = await request(app)
      .post("/experiences")
      .field("experience", JSON.stringify(testExperience))
      .attach("foodPhoto", testFoodPhotoBuffer, "testFoodPhoto.png")
      .attach("personPhoto", testPersonPhotoBuffer, "testPersonPhoto.jpg")
      .set("Content-Type", "multipart/form-data")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(201);
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testExperience = {
      title: "This shouldn't work"
    };

    const res = await request(app)
      .post("/experiences")
      .field("experience", JSON.stringify(testExperience))
      .attach("foodPhoto", testFoodPhotoBuffer, "testFoodPhoto.png")
      .attach("personPhoto", testPersonPhotoBuffer, "testPersonPhoto.jpg")
      .set("Content-Type", "multipart/form-data")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(400);
  });
});