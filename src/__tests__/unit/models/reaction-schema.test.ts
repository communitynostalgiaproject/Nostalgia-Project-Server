import mongoose from "mongoose";
import ExperienceModel from "../../../models/experience.model";
import UserModel from "../../../models/user.model";  
import ReactionModel from "../../../models/reaction.model";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Experience } from "@projectTypes/experience";
import { User } from "@projectTypes/user";
import { createExperiences } from "../../../utils/testDataGen";

let mongoServer: MongoMemoryServer;
let testUser: User;
let testExperience: Experience;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);

  testUser = await new UserModel({
    googleId: "1234",
    displayName: "Just A. User",
    emailAddress: "justauser@test.com"
  }).save();
  testExperience = await new ExperienceModel(createExperiences(1)[0]).save();
});

beforeEach(async () => {
  await ReactionModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    mongoServer.stop();
  }
});

describe("Reaction model test", () => {
  it("successfully creates a reaction", async () => {
    const newReaction = await new ReactionModel({
      reaction: "meToo",
      experienceId: testExperience._id,
      userId: testUser._id
    }).save();
    expect(newReaction._id).toBeDefined();
  });

  it("fails to save reaction without reaction", async () => {
    const newReaction = new ReactionModel({
      experienceId: testExperience._id,
      userId: testUser._id
    });

    await expect(newReaction.save()).rejects.toThrowError();
  });

  it("fails to save reaction with invalid reaction type", async () => {
    const newReaction = new ReactionModel({
      reaction: "whatever",
      experienceId: testExperience._id,
      userId: testUser._id
    });

    await expect(newReaction.save()).rejects.toThrowError();
  });

  it("fails to save reaction without userId", async () => {
    const newReaction = new ReactionModel({
      reaction: "meToo",
      experienceId: testExperience._id
    });

    await expect(newReaction.save()).rejects.toThrowError();
  });

  it("fails to save reaction without experienceId", async () => {
    const newReaction = new ReactionModel({
      reaction: "meToo",
      userId: testUser._id
    });

    await expect(newReaction.save()).rejects.toThrowError();
  });

  it("applies correct default values", async () => {
    const newReaction = new ReactionModel({
      reaction: "meToo",
      experienceId: testExperience._id,
      userId: testUser._id
    });

    const savedFlag = await newReaction.save();
    expect(savedFlag._id).toBeDefined();
    expect(savedFlag.createdDate.toDateString()).toBe((new Date).toDateString());
  });
});
