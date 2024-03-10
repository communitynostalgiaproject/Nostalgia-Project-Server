import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createReactions, createRandomId } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ReactionModel from "../../../../models/reaction.model";
import { performLogin, performLogout } from "../../../../utils/testUtils";

let mongoServer: MongoMemoryServer;
let app: Express;
const mockExperienceId = createRandomId();

describe("DELETE/experiences/{experienceId}/reactions/{reactionId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = await setupApp(uri);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testReaction = createReactions(1)[0];
    const insertedReaction = await new ReactionModel(testReaction).save();

    const res = await request(app).delete(`/experiences/${mockExperienceId}/reactions/${insertedReaction._id}`);

    expect(res.status).toBe(401);
  });

  it("should return a 403 code if user does not have permission", async () => {
    const { sessionCookie, testUser } = await performLogin(app);

    try {
      const testReaction = createReactions(1)[0];
      const insertedReaction = await new ReactionModel(testReaction).save();
  
      expect(insertedReaction._id).not.toBe(testUser._id);
  
      const res = await request(app)
        .delete(`/experiences/${mockExperienceId}/reactions/${insertedReaction._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(403);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });

  it("should return a 200 code upon success and should delete the db record", async () => {
    const { sessionCookie, testUser } = await performLogin(app);

    try {
      const testReaction = createReactions(1)[0];
      const insertedReaction = await new ReactionModel({
        ...testReaction,
        userId: testUser._id
      }).save();

      const res = await request(app)
        .delete(`/experiences/${mockExperienceId}/reactions/${insertedReaction._id}`)
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);
      
      const retrievedExperience = await ReactionModel.findById(insertedReaction._id);
      expect(retrievedExperience).toBeNull();
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });
});