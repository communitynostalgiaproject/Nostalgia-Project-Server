import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";
import { performLogin, performLogout, upgradePermissions } from "../../../../utils/testUtils";

let mongoServer: MongoMemoryServer;
let app: Express;

const convertValueToString: any = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertValueToString);

  const result: { [key: string]: any } = {};

  for (let key in obj) {
    switch(key) {
        case "_id":
            result[key] = obj[key].toString();
            break;
        case "joinedDate":
            result[key] = obj[key].toISOString();
            break;
        default:
            result[key] = convertValueToString(obj[key]);
    }
  }
  return result;
}


describe("GET /users", () => {
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

  it("returns 200 code and array of user data with sensitive information removed if user is not a moderator", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    try {
      const testUsers = createUsers(10);
      await UserModel.insertMany(testUsers);
   
      const res = await request(app)
        .get(`/users`)
        .set("Cookie", sessionCookie);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach((user: any) => {
        const isTestUser = user._id === testUser._id;

        if (isTestUser) {
          expect(user.googleId).toBeDefined();
          expect(user.isModerator).toBeDefined();
          expect(user.emailAddress).toBeDefined();
        } else {
          expect(user.googleId).not.toBeDefined();
          expect(user.isModerator).not.toBeDefined();
          expect(user.emailAddress).not.toBeDefined();
        }
      });
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and an array of users with all user data if user is logged in as moderator", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    });

    try {
      const testUsers = createUsers(10);
      await UserModel.insertMany(testUsers);
   
      const res = await request(app)
        .get(`/users`)
        .set("Cookie", sessionCookie);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((user: any) => {
        expect(user.googleId).toBeDefined();
        expect(user.isModerator).toBeDefined();
        expect(user.emailAddress).toBeDefined();
      });
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});