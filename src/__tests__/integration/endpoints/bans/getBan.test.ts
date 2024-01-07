import request from "supertest";
import { setupApp } from "../../../../config/app";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { randomInt } from "crypto";
import { ObjectId } from "mongodb";
import { MAX_BANS } from "../../../../config/constants";
import mongoose from "mongoose";
import BanModel from "../../../../models/ban.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("GET /users/:userId/bans", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = setupApp(mongoUri);
  });

  beforeEach(async () => {
    await BanModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("returns a 200 code and the ban document for the user if one exists", async () => {
    const mockUserId = new ObjectId(randomInt(99999));
    const newBan = await BanModel.create({
      userId: mockUserId,
      reason: "Test"
    });

    const res = await request(app).get(`/users/${mockUserId}/bans`);
    
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body?._id.toString()).toBe(newBan._id.toString());
  });

  it("returns a 404 code if no ban exists for the user", async () => {
    const res = await request(app).get(`/users/${new ObjectId(randomInt(99999))}/bans`);
    
    expect(res.status).toBe(404);
  });

  it("returns a 400 code if given an invalid userId", async () => {
    const res = await request(app).get(`/users/12345/bans`);
    
    expect(res.status).toBe(400);   
  });
});