import { setupApp } from "../../../config/app";
import { performLogin, performLogout } from "../../../utils/testUtils";
import { Express } from "express";
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import UserModel from "../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("User creation tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = await setupApp(uri);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("creates a new user document and sets firstLogin to 'true' after first login", async () => {
    const { testUser } = await performLogin(app);

    try {
      expect(testUser).toBeDefined();
      expect(testUser.firstLogin).toBe(true);
      expect(testUser.loginCount).toBe(1);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("has updated firstLogin to 'false' after subsequent login", async () => {
    const { testUser } = await performLogin(app);

    try {
      expect(testUser).toBeDefined();
      expect(testUser.firstLogin).toBe(true);

      await performLogout(app);

      const { testUser: secondLoginUser } = await performLogin(app, { googleId: testUser.googleId });
      expect(secondLoginUser).toBeDefined();
      expect(secondLoginUser._id).toBe(testUser._id);
      expect(secondLoginUser.firstLogin).toBe(false);
      expect(secondLoginUser.loginCount).toBe(2);
    } catch(err) {
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });
});