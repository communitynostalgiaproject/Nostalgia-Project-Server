import request from "supertest";
import { setupApp } from "../../../../config/app";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { randomInt } from "crypto";
import {
  performLogin,
  performLogout,
  upgradePermissions
} from "../../../../utils/testUtils";
import { ObjectId } from "mongodb";
import { MAX_BANS } from "../../../../config/constants";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";
import BanModel from "../../../../models/ban.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("DELETE /users/{userId}/bans", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = await setupApp(mongoUri);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await BanModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("returns a 401 code if the user is not logged in", async () => {
    const res = await request(app).delete(`/users/${new ObjectId(1234)}/bans`);

    expect(res.status).toBe(401);
  });

  it("returns a 403 code if the user is unauthorized", async () => {
    const { sessionCookie } = await performLogin(app);

    try {
      const res = await request(app)
        .delete(`/users/${new ObjectId(1234)}/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(403);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and updates the ban's 'active' status to 'false' if the user was banned", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    })

    try {
      const mockUserId = new ObjectId(randomInt(99999));
      const newBan = await BanModel.create({
        userId: mockUserId,
        reason: "Test"
      });
      expect(newBan._id).toBeDefined();
      expect(newBan.active).toBe(true);

      const res = await request(app)
        .delete(`/users/${mockUserId}/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      
      const retrievedBan = await BanModel.findById(newBan._id);
      expect(retrievedBan).toBeDefined();
      expect(retrievedBan?.active).toBe(false);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 409 code if a ban record does not exist for the user", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    })

    try {
      const mockUserId = new ObjectId(randomInt(99999));

      const res = await request(app)
        .delete(`/users/${mockUserId}/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(409);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 409 code if the ban is inactive", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    })

    try {
      const mockUserId = new ObjectId(randomInt(99999));
      const newBan = await BanModel.create({
        userId: mockUserId,
        reason: "Test",
        active: false
      });
      expect(newBan._id).toBeDefined();
      expect(newBan.active).toBe(false);

      const res = await request(app)
        .delete(`/users/${mockUserId}/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(409);
      
      const retrievedBan = await BanModel.findById(newBan._id);
      expect(retrievedBan).toBeDefined();
      expect(retrievedBan?.active).toBe(false);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 409 code if the user is currently banned and has already been banned MAX_BANS times", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    })

    try {
      const mockUserId = new ObjectId(randomInt(99999));
      const newBan = await BanModel.create({
        userId: mockUserId,
        reason: "Test",
        banCount: MAX_BANS
      });
      expect(newBan._id).toBeDefined();
      expect(newBan.active).toBe(true);

      const res = await request(app)
        .delete(`/users/${mockUserId}/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(409);
      
      const retrievedBan = await BanModel.findById(newBan._id);
      expect(retrievedBan).toBeDefined();
      expect(retrievedBan?.active).toBe(true);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 400 code if given an invalid userId", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    })

    try {
      const res = await request(app)
        .delete(`/users/12345/bans`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(400);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});