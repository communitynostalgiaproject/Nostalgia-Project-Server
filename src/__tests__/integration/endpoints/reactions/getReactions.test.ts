import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences, createUsers, createReactions } from "../../../../utils/testDataGen";
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

describe("GET /flags", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);
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

  it("returns a 200 code and DEFAULT_LIMIT records if there are enough records and no other params are specified", async () => {
    const testReactions = createReactions(DEFAULT_LIMIT * 2);
    await ReactionModel.insertMany(testReactions);


    const res = await request(app).get(`/reactions`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(DEFAULT_LIMIT);
  });
});