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

describe("PATCH /users/{userId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = await setupApp(uri);
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

    const updatedUser = {
      ...insertedUser,
      displayName: "Updated"
    };

    const res = await request(app)
      .patch(`/users/${insertedUser._id}`)
      .send(updatedUser);

    expect(res.status).toBe(401);
  });

  it("returns a 403 code if user is not authorized", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    const testOtherUser = createUsers(1)[0];
    const insertedUser = await new UserModel(testOtherUser).save();

    const updatedUser = {
      ...insertedUser,
      displayName: "Updated"
    };

    try {
      const insertedUser = await new UserModel(createUsers(1)[0]).save();
  
      const res = await request(app)
        .patch(`/users/${insertedUser._id}`)
        .send(updatedUser)
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

    const updatedUser = {
      ...testUser,
      displayName: "Updated"
    };

    try {
      const res = await request(app)
        .patch(`/users/${testUser._id}`)
        .send(updatedUser)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      
      const retrievedUser = await UserModel.findById(testUser._id);
      expect(retrievedUser?.displayName).toBe(updatedUser.displayName);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 400 code if invalid ID is passed", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    const updatedUser = {
      ...testUser,
      displayName: "Updated"
    };

    try {
      const res = await request(app)
        .patch(`/users/1234`)
        .send(updatedUser)
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(400);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});