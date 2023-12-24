import mongoose from "mongoose";
import UserModel from "../../../models/user.model";  
import BanModel from "../../../models/reaction.model";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from "@projectTypes/user";
import { createUsers } from "../../../utils/testDataGen";

let mongoServer: MongoMemoryServer;
let testUser: User;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);

  testUser = await new UserModel(createUsers(1)[0]).save();
});

beforeEach(async () => {
  await BanModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    mongoServer.stop();
  }
});

describe("Ban model test", () => {
  it("successfully creates document", async () => {
    const newDocument = await new BanModel({
      userId: testUser._id,
      reason: "Spam"
    }).save();
    expect(newDocument._id).toBeDefined();
  });

  it("fails to save without userId", async () => {
    const newDocument = new BanModel({
        reason: "Spam"
    });

    await expect(newDocument.save()).rejects.toThrowError();
  });

  it("applies correct default values", async () => {
    const newDocument = new BanModel({
      userId: testUser._id,
      reason: "Spam"
    });

    const savedDocument = await newDocument.save();
    expect(savedDocument._id).toBeDefined();
    expect(savedDocument.createdDate.toDateString()).toBe((new Date).toDateString());
    expect(savedDocument.status).toBe("active");
    expect(savedDocument.banCount).toBe(1);
  });
});
