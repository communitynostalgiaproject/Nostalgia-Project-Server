import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createReactions } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ReactionModel from "../../../../models/reaction.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("GET /reaction/{reactionId}", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
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

  it("should return a 200 code and the requested record if found", async () => {
    const testReaction = createReactions(1)[0];
    const insertedReaction = await new ReactionModel(testReaction).save();
    console.log(`insertedReaction: ${insertedReaction}`);

    const res = await request(app).get(`/reactions/${insertedReaction._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toEqual(insertedReaction._id.toString());
  });

  it("should return a 404 code if experience with provided id doesn't exist", async () => {
    const res = await request(app).get("/reactions/653d557c56be3d6d264edda2");

    expect(res.status).toBe(404);
  });
});