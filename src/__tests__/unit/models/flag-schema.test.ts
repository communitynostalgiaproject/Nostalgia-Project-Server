import mongoose from "mongoose";
import CommentModel from "../../../models/comment.model";
import ExperienceModel from "../../../models/experience.model";
import UserModel from "../../../models/user.model";  
import FlagModel from "../../../models/flag.model";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Experience } from "@projectTypes/experience";
import { User } from "@projectTypes/user";
import { Comment } from "@projectTypes/comment";

let mongoServer: MongoMemoryServer;
let testUser: User;
let testExperience: Experience;
let testComment: Comment;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);

  testUser = await new UserModel({
    googleId: "1234",
    displayName: "Just A. User",
    emailAddress: "justauser@test.com"
  }).save();
  testExperience = await new ExperienceModel({
    title: "Test title",
      place: {
        address: { someProperty: "value" },
        location: {
          type: "Point",
          coordinates: [125.6, 10.1]
        }
      },
      description: "Test description",
      experienceDate: "2023-10-12"
  }).save();
  testComment = await new CommentModel({
    experienceId: testExperience._id,
    text: "This is some random comment about an experience",
    creatorId: testUser._id
  }).save();
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

describe("Flag model test", () => {
  it("successfully creates a flag for an experience", async () => {
    const experienceFlag = new FlagModel({
      contentId: testExperience._id,
      contentType: "Experience",
      userId: testUser._id,
      userComment: "Post contains offensive statements."
    });

    try {
      const savedFlag = await experienceFlag.save();
      expect(savedFlag._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("successfully creates a flag for a comment", async () => {
    const commentFlag = new FlagModel({
      contentId: testComment._id,
      contentType: "Comment",
      userId: testUser._id,
      userComment: "Post contains offensive statements."
    });

    try {
      const savedFlag = await commentFlag.save();
      expect(savedFlag._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("fails to save flag without contentId", async () => {
    const experienceFlag = new FlagModel({
      contentType: "Experience",
      userId: testUser._id,
      userComment: "Post contains offensive statements."
    });

    await expect(experienceFlag.save()).rejects.toThrowError();
  });

  it("fails to save flag without contentType", async () => {
    const experienceFlag = new FlagModel({
      contentId: testExperience._id,
      userId: testUser._id,
      userComment: "Post contains offensive statements."
    });

    await expect(experienceFlag.save()).rejects.toThrowError();
  });

  it("fails to save flag without userId", async () => {
    const experienceFlag = new FlagModel({
      contentId: testExperience._id,
      contentType: "Experience",
      userComment: "Post contains offensive statements."
    });

    await expect(experienceFlag.save()).rejects.toThrowError();
  });

  it("applies correct default values", async () => {
    const experienceFlag = new FlagModel({
      contentId: testExperience._id,
      contentType: "Experience",
      userId: testUser._id,
      userComment: "Post contains offensive statements."
    });

    try {
      const savedFlag = await experienceFlag.save();
      expect(savedFlag._id).toBeDefined();
      expect(savedFlag.createdDate.toDateString()).toBe((new Date).toDateString());
      expect(savedFlag.resolved).toBe(false);
      expect(savedFlag.contentDeleted).toBe(false);
    } catch (error) {
        console.error(error);
        throw error;
    }
  });
});
