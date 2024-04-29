import request from "supertest";
import { setupApp } from "../../../../config/app";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin } from "../../../../utils/testUtils";
import BanModel from "../../../../models/ban.model";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let mongoServer: MongoMemoryServer;
let app: Express;
let testUser: any;
let sessionCookie: string;
let photoBuffer: Buffer;
let prevImgUrl: string;

describe("POST /experiences/images/update", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = await setupApp(mongoUri);

    const loginResults = await performLogin(app);
    sessionCookie = loginResults.sessionCookie;
    testUser = loginResults.testUser;

    photoBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "..", "assets", "testFoodPhoto.png"));
    prevImgUrl = "https://testImgUrl.com/whatever.png";
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const res = await request(app)
      .post("/experiences/images/update")
      .field("imageUrl", prevImgUrl)
      .attach("image", photoBuffer, "testPhoto.png")
      .set("Content-Type", "multipart/form-data");

    expect(res.status).toBe(401);
  });

  it("should return a 200 code on success", async () => {
    const res = await request(app)
      .post("/experiences/images/update")
      .field("imageUrl", prevImgUrl)
      .attach("image", photoBuffer, "testPhoto.png")
      .set("Content-Type", "multipart/form-data")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBeDefined();
    expect(res.body.imageUrl).not.toBe(prevImgUrl)
  });


  it("should return a 400 code if no image was submitted", async () => {
    const res = await request(app)
      .post("/experiences/images/update")
      .field("imageUrl", prevImgUrl)
      .set("Content-Type", "multipart/form-data")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(400);
  });

  it("should return a 403 code if user is banned", async () => {
    const userBan = await BanModel.create({
      userId: testUser._id,
      reason: "Test ban"
    });
    expect(userBan).toBeDefined();
    expect(userBan?.active).toBe(true);
    const res = await request(app)
      .post("/experiences/images/update")
      .field("imageUrl", prevImgUrl)
      .attach("image", photoBuffer, "testPhoto.png")
      .set("Content-Type", "multipart/form-data")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(403);
  });
});