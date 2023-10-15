import mongoose from "mongoose";
import CommentModel from "../models/comment.model";
import ExperienceModel from "../models/experience.model";
import UserModel from "../models/user.model";  
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Experience } from "types/experience";
import { User } from "types/user";

let mongoServer: MongoMemoryServer;
let testUser: User;
let testExperience: Experience;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);

  testUser = await new UserModel({
    googleId: "1234",
    displayName: "Just A. User"
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

describe("Comment model test", () => {
  it("successfully creates a comment", async () => {
    const comment = new CommentModel({
      experienceId: testExperience._id,
      text: "This is some random comment about an experience",
      creatorId: testUser._id
    });

    try {
      const savedComment = await comment.save();
      expect(savedComment._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  });

  it("fails to save comment without associated experience", async () => {
    const comment = new CommentModel({
      text: "This is some random comment about nothing",
      creatorId: testUser._id
    });

    await expect(comment.save()).rejects.toThrowError();
  });

  it("fails to save comment without empty text string", async () => {
    const comment = new CommentModel({
      experienceId: testExperience._id,
      text: "",
      creatorId: testUser._id
    });

    await expect(comment.save()).rejects.toThrowError(); 
  });

  it("successfully saves comment without creatorId", async () => {
    const comment = new CommentModel({
      experienceId: testExperience._id,
      text: "This is some random comment about an experience"
    });

    try {
      const savedComment = await comment.save();
      expect(savedComment._id).toBeDefined();
    } catch (error) {
        console.error(error);
        throw error;
    }
  })
});
