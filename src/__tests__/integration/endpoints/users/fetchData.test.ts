import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin, performLogout } from "../../../../utils/testUtils";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("GET /users/fetchData", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = setupApp(uri);
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

  it("returns a 401 code if user is not logged in", async () => {
    const testUser = createUsers(1)[0];
    const insertedUser = await new UserModel(testUser).save();

    const res = await request(app).delete(`/users/${insertedUser._id}`);

    expect(res.status).toBe(401);
  });

  it("returns a 200 code and the logged in user's info upon success", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    try {
      const res = await request(app)
        .get(`/users/fetchData`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(testUser._id);
      expect(res.body.googleId).toBe(testUser.googleId);
      expect(res.body.displayName).toBe(testUser.displayName);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});