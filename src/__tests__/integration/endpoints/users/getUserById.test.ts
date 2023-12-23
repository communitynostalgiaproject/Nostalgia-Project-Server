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

  it("returns a 401 code if user is not logged in.", async () => {
      const testUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testUser).save();
      
      const res = await request(app).get(`/users/${insertedUser._id}`);
  
      expect(res.status).toBe(401);
  });

  it("returns a 403 code if user is not authorized.", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    expect(testUser.isModerator).toBe(false);
    expect(testUser.isAdmin).toBe(false);

    try {
      const testUser = createUsers(1)[0];
      const insertedUser = await new UserModel(testUser).save();
      
      const res = await request(app)
        .get(`/users/${insertedUser._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(403);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and the requested record if found", async () => {
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
      expect(res.body).toEqual(convertValueToString(insertedUser.toObject()));
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