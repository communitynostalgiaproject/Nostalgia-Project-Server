import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createRandomId } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import { performLogin, performLogout } from "../../../../utils/testUtils";
import ReactionModel from "../../../../models/reaction.model";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;
let mockExperienceId = createRandomId();

const removeMongooseDocFields: any = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item: any) => removeMongooseDocFields(item));
  }

  const newObj: any = {};
  for (let key in obj) {
    if (key !== "__v" && key !== "_id") {
      newObj[key] = removeMongooseDocFields(obj[key]);
    }
  }

  return newObj;
};

describe("PUT /experiences/{experienceId}/reactions", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    app = await setupApp(mongoUri);
  });

  afterEach(async() => {
    ReactionModel.deleteMany({});
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testReaction = {
      reaction: "meToo"
    };

    const res = await request(app)
      .put(`/experiences/${mockExperienceId}/reactions/remove`)
      .send(testReaction)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 200 code upon success and delete the reaction if it exists", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const testReaction = {
        reaction: "meToo"
      };
      const existingReaction = await ReactionModel.create({
        userId: testUser._id,
        experienceId: mockExperienceId,
        reaction: testReaction.reaction
      });
      expect(existingReaction._id).toBeDefined();
      expect(existingReaction.reaction).toBe(testReaction.reaction);
  
      const res = await request(app)
        .put(`/experiences/${mockExperienceId}/reactions/remove`)
        .send(testReaction)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);

      const deletedReaction = await ReactionModel.findOne({
        userId: testUser._id,
        experienceId: mockExperienceId,
        reaction: testReaction.reaction
      });

      expect(deletedReaction).toBeNull();
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });

  it("should return a 200 code even if reaction does not exist", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const nonExistentReaction = {
        userId: testUser._id,
        experienceId: mockExperienceId,
        reaction: "willTry"
      };
      const queryResult = await ReactionModel.findOne(nonExistentReaction);

      expect(queryResult).toBeNull();

      const res = await request(app)
        .put(`/experiences/${mockExperienceId}/reactions/remove`)
        .send({reaction: nonExistentReaction.reaction})
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });
});