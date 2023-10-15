import mongoose from "mongoose";
import User from "../models/user.model";
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
  it("successfully creates new user", async() => {
    const newUser = new User({
      googleId: "1234",
      displayName: "Just A. User"
    });

    try {
      const savedUser = await newUser.save();
      expect(savedUser._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("fails to create user without googleId", async () => {
    const newUser = new User({
      displayName: "Just A. User"
    });

    await expect(newUser.save()).rejects.toThrowError();
  });

  it("allows creation of new user without displayName", async () => {
    const newUser = new User({
      googleId: "1234"
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
