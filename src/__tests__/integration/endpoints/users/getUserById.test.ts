import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin, performLogout, upgradePermissions } from "../../../../utils/testUtils";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

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


describe("GET /users/{userId}", () => {

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

  it("returns a 200 code and the requested record with sensitive data removed if logged in user is not a moderator and is not the user", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();

    try {
      const testOtherUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testOtherUser).save();
      
      const res = await request(app)
        .get(`/users/${insertedUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      expect(res.body._id).toBeDefined()
      expect(`${res.body._id}`).toBe(`${insertedUser._id}`);
      expect(res.body.displayName).toBeDefined();
      expect(res.body.displayName).toBe(insertedUser.displayName);

      expect(res.body.googleId).not.toBeDefined();
      expect(res.body.isModerator).not.toBeDefined();
      expect(res.body.emailAddress).not.toBeDefined();
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and the requested record with all data if user is logged in as the user", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
      
    try {
      const res = await request(app)
        .get(`/users/${testUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      expect(res.body._id).toBeDefined()
      expect(`${res.body._id}`).toBe(`${testUser._id}`);
      expect(res.body.displayName).toBeDefined();
      expect(res.body.displayName).toBe(testUser.displayName);
      expect(res.body.googleId).toBeDefined();
      expect(res.body.googleId).toBe(testUser.googleId);
      expect(res.body.isModerator).toBeDefined();
      expect(res.body.isModerator).toBe(testUser.isModerator);
      expect(res.body.emailAddress).toBeDefined();
      expect(res.body.emailAddress).toBe(testUser.emailAddress);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and the requested record with all data if user is logged in as a moderator", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    });

    try {
      const testUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testUser).save();
      
      const res = await request(app)
        .get(`/users/${insertedUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      expect(res.body._id).toBeDefined()
      expect(`${res.body._id}`).toBe(`${insertedUser._id}`);
      expect(res.body.displayName).toBeDefined();
      expect(res.body.displayName).toBe(insertedUser.displayName);
      expect(res.body.googleId).toBeDefined();
      expect(res.body.googleId).toBe(insertedUser.googleId);
      expect(res.body.isModerator).toBeDefined();
      expect(res.body.isModerator).toBe(insertedUser.isModerator);
      expect(res.body.emailAddress).toBeDefined();
      expect(res.body.emailAddress).toBe(insertedUser.emailAddress);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 400 code if invalid ID is provided", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    });

    try {
      const testUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testUser).save();
      
      const res = await request(app)
        .get(`/users/invaliddocumentid`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(400);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 404 code if the document does not exist", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    await upgradePermissions(app, {
      testUser,
      makeModerator: true
    });

    try {
      const testUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testUser).save();
      
      const res = await request(app)
        .get(`/users/${new ObjectId(57).toHexString()}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(404);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});