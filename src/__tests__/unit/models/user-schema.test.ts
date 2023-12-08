import mongoose from "mongoose";
import User from "../../../models/user.model";
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
})

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    mongoServer.stop();
  }
});

describe("User model test", () => {
  it("successfully creates new user", async () => {
    const newUser = new User({
      googleId: "1234",
      displayName: "Just A. User",
      emailAddress: "justauser@test.com"
    });

    try {
      const savedUser = await newUser.save();
      expect(savedUser._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("sets correct default values when not specified", async () => {
    const newUser = new User({
      googleId: "1234",
      displayName: "Just A. User",
      emailAddress: "justauser@test.com"
    });

    try {
      const savedUser = await newUser.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.isModerator).toBe(false);
      expect(savedUser.isAdmin).toBe(false);
      expect(savedUser.joinedDate.toDateString()).toBe((new Date).toDateString());
      expect(savedUser.firstLogin).toBe(true);
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("fails to create user without a googleId", async () => {
    const newUser = new User({
      displayName: "Just A. User",
      emailAddress: "justauser@test.com"
    });

    await expect(newUser.save()).rejects.toThrowError();
  });

  it("fails to create user without an email address", async () => {
    const newUser = new User({
      googleId: "1234",
      displayName: "Just A. User"
    });

    await expect(newUser.save()).rejects.toThrowError();
  });

  it("allows creation of new user without displayName", async () => {
    const newUser = new User({
      googleId: "1234",
      emailAddress: "justauser@test.com"
    });

    try {
      const savedUser = await newUser.save();
      expect(savedUser._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });
});
