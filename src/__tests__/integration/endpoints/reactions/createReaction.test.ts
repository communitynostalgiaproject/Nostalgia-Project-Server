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
      .put(`/experiences/${mockExperienceId}/reactions`)
      .send(testReaction)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 201 code after creating a reaction", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const testReaction = {
        reaction: "meToo"
      };
  
      const res = await request(app)
        .put(`/experiences/${mockExperienceId}/reactions`)
        .send(testReaction)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(201);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });

  it("should return a 200 code if reaction already exists", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const existingReaction = await ReactionModel.create({
        userId: testUser._id,
        experienceId: mockExperienceId,
        reaction: "meToo"
      });
      expect(existingReaction._id).toBeDefined();
      expect(existingReaction.reaction).toBe("meToo");
  
      const res = await request(app)
        .put(`/experiences/${mockExperienceId}/reactions`)
        .send({reaction: existingReaction.reaction})
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const testReaction = {
        reaction: "whatever"
      };
  
      const res = await request(app)
        .put(`/experiences/${mockExperienceId}/reactions`)
        .send(testReaction)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(400);
    } catch (err) {
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });
});