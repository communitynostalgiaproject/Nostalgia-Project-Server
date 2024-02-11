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
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";
import BanModel from "../../../../models/ban.model";

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
};

describe("POST /users/:userId/bans", () => {
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

  it("should return a 401 code if user is not logged in", async () => {
    const res = await request(app)
      .post(`/users/${new ObjectId(1234)}/bans`)
      .send({
        reason: "Test reason"
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 403 code if user is not authorized", async () => {
    const { sessionCookie } = await performLogin(app);

    try {
        const res = await request(app)
          .post(`/users/${new ObjectId(1234)}/bans`)
          .send({
            reason: "Test reason"
          })
          .set("Content-Type", "application/json")
          .set("Cookie", sessionCookie);
    
        expect(res.status).toBe(403);
    } catch(err) {
        throw err;
    } finally {
        await performLogout(app);
    }
  });

  it("inserts a new ban document if one doesn't currently exist and returns a 200 code", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
        testUser,
        makeModerator: true
    });

    try {
        const mockUserId = new ObjectId(randomInt(99999));
        const banCheck = await BanModel.findOne({ userId: mockUserId });
        expect(banCheck).toBe(null);

        const res = await request(app)
          .post(`/users/${mockUserId}/bans`)
          .send({
            reason: "Test reason"
          })
          .set("Content-Type", "application/json")
          .set("Cookie", sessionCookie);
    
        expect(res.status).toBe(200);

        const banCheck2 = await BanModel.findOne({ userId: mockUserId });
        expect(banCheck2).not.toBe(null);

        expect(banCheck2?.reason).toBe("Test reason");
        expect(banCheck2?.userId).toStrictEqual(mockUserId);
    } catch(err) {
        throw err;
    } finally {
        await performLogout(app);
    }
  });

  it("updates existing ban to be active if currently inactive and returns a 200 code", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
        testUser,
        makeModerator: true
    });

    try {
        const mockUserId = new ObjectId(randomInt(99999));
        const newBan = await BanModel.create({
            userId: mockUserId,
            reason: "Test reason",
            active: false
        });
        expect(newBan).toBeDefined();
        expect(newBan?.userId).toStrictEqual(mockUserId);
        expect(newBan?.active).toBe(false);

        const res = await request(app)
          .post(`/users/${mockUserId}/bans`)
          .send({
            reason: "New reason"
          })
          .set("Content-Type", "application/json")
          .set("Cookie", sessionCookie);
    
        expect(res.status).toBe(200);

        const updatedBan = await BanModel.findById(newBan?._id);
        expect(updatedBan).toBeDefined();
        expect(updatedBan?.reason).toBe("New reason");
        expect(updatedBan?.active).toBe(true);
    } catch(err) {
        throw err;
    } finally {
        await performLogout(app);
    }
  });

  it("returns a 409 code if user is already banned", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
        testUser,
        makeModerator: true
    });

    try {
        const mockUserId = new ObjectId(randomInt(99999));
        const newBan = await BanModel.create({
            userId: mockUserId,
            reason: "Test reason"
        });
        expect(newBan).toBeDefined();
        expect(newBan?.userId).toStrictEqual(mockUserId);
        expect(newBan?.active).toBe(true);

        const res = await request(app)
          .post(`/users/${mockUserId}/bans`)
          .send({
            reason: "New reason"
          })
          .set("Content-Type", "application/json")
          .set("Cookie", sessionCookie);
    
        expect(res.status).toBe(409);
    } catch(err) {
        throw err;
    } finally {
        await performLogout(app);
    }
  });

  it("returns a 400 code if invalid userId is passed", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, {
        testUser,
        makeModerator: true
    });

    try {
        const res = await request(app)
          .post(`/users/234/bans`)
          .send({
            reason: "New reason"
          })
          .set("Content-Type", "application/json")
          .set("Cookie", sessionCookie);
    
        expect(res.status).toBe(400);
    } catch(err) {
        throw err;
    } finally {
        await performLogout(app);
    }
  });
});