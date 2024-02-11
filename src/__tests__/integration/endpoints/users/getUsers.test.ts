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

  it("returns a 401 code if user is not logged in", async () => {
    const testUsers = createUsers(6);
    const insertedUsers = await UserModel.insertMany(testUsers);

    let userArr = [];
    for (let userObj of insertedUsers) {
      let user = convertValueToString(userObj.toObject());
      userArr.push(user);
    }
    
    const res = await request(app).get(`/users`);
    
    expect(res.status).toBe(401);
  });

  it("returns a 403 code if user is not authorized", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    expect(sessionCookie).toBeDefined();
    expect(testUser).toBeDefined();
    expect(testUser.isModerator).toBe(false);
    expect(testUser.isAdmin).toBe(false);

    try {
      const testUsers = createUsers(6);
      const insertedUsers = await UserModel.insertMany(testUsers);
  
      let userArr = [];
      for (let userObj of insertedUsers) {
        let user = convertValueToString(userObj.toObject());
        userArr.push(user);
      }
      
      const res = await request(app)
        .get(`/users`)
        .set("Cookie", sessionCookie);
      
      expect(res.status).toBe(403);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });

  it("returns a 200 code and a list of users upon success", async () => {
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
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app);
    }
  });
});