import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin, performLogout, upgradePermissions } from "../../../../utils/testUtils";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("DELETE /users/{userId}", () => {
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

  it("returns a 403 code if user is not authorized", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    try {
      const insertedUser = await new UserModel(createUsers(1)[0]).save();
  
      const res = await request(app)
        .delete(`/users/${insertedUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(403);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code upon success", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    try {
      const res = await request(app)
        .delete(`/users/${testUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      
      const retrievedUser = await UserModel.findById(testUser._id);
      expect(retrievedUser).toBeNull();
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 400 code if invalid ID is passed", async () => {
    const { sessionCookie } = await performLogin(app);

    try {
      const res = await request(app)
        .delete(`/users/1234`)
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(400);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});