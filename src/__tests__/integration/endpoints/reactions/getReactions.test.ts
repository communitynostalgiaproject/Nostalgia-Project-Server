import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createReactions, createRandomId, createRandomIds } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ReactionModel from "../../../../models/reaction.model";
import { DEFAULT_LIMIT } from "../../../../config/constants";
import { randomInt } from "crypto";
import { Flag } from "@projectTypes/flag";
import { faker } from "@faker-js/faker";

let mongoServer: MongoMemoryServer;
let app: Express;
const mockExperienceId = createRandomId();

describe("GET /experiences/{experienceId}/reactions", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = await setupApp(uri);
  });

  beforeEach(async () => {
    await ReactionModel.deleteMany({});
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("returns a 200 code and all reactions for a given experience if no other params are specified", async () => {
    const fakeExperienceIds = createRandomIds(50);
    const testReactions = createReactions(200, [mockExperienceId, ...fakeExperienceIds]);
    await ReactionModel.insertMany(testReactions);


    const res = await request(app).get(`/experiences/${mockExperienceId}/reactions`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    console.log(`Reactions for mockExperienceId: ${JSON.stringify(res.body)}`);
    res.body.forEach((reaction: any) => {
      expect(reaction.experienceId.toString()).toBe(mockExperienceId);
    });
  });

  it("returns only reactions by the given user for the given experience when userId query param is passed", async () => {
    const fakeExperienceIds = createRandomIds(3);
    const fakeUserIds = createRandomIds(3);
    const testUser = createRandomId();
    const testUserReactionsForMockExperience = createReactions(2, [mockExperienceId], [testUser]);
    const testUserReactionsForOtherExperiences = createReactions(4, fakeExperienceIds, [testUser]);
    const testReactions = createReactions(25, [mockExperienceId, ...fakeExperienceIds], fakeUserIds);
    await ReactionModel.insertMany([...testReactions, ...testUserReactionsForMockExperience, ...testUserReactionsForOtherExperiences]);

    const res = await request(app).get(`/experiences/${mockExperienceId}/reactions?userId=${testUser}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((reaction: any) => {
      expect(reaction.experienceId.toString()).toBe(mockExperienceId);
      expect(reaction.userId.toString()).toBe(testUser);
    });
  });
});