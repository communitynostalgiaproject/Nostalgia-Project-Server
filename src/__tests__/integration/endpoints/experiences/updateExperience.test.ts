import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";
import { performLogin, performLogout, upgradePermissions } from "../../../../utils/testUtils";

let mongoServer: MongoMemoryServer;
let app: Express;

const convertObjectIdToString: any = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertObjectIdToString);

  const result: { [key: string]: any } = {};
  for (let key in obj) {
    if (key === '_id' && obj[key] instanceof mongoose.Types.ObjectId) {
      result[key] = obj[key].toString();
    } else {
      result[key] = convertObjectIdToString(obj[key]);
    }
  }
  return result;
}

describe("PATCH /experiences", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = await setupApp(uri);
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 401 code if user is not logged in", async () => {
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();
    const updatedExperience = {
      ...insertedExperience.toObject(),
      description: "This description has been updated."
    };

    const res = await request(app)
      .patch(`/experiences/${insertedExperience._id}`)
      .send(updatedExperience)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
  });

  it("should return a 403 code if the user does not have permission", async () => {
    const { sessionCookie, testUser } = await performLogin(app);

    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
      expect(insertedExperience.creatorId).not.toBe(testUser._id);

      const updatedExperience = {
        ...insertedExperience.toObject(),
        description: "This description has been updated."
      };
  
      const res = await request(app)
        .patch(`/experiences/${insertedExperience._id}`)
        .send(updatedExperience)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(403);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should return a 200 code upon success and should update the db record", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    
    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel({
        ...testExperience,
        creatorId: testUser._id
      }).save();
      const updatedExperience = {
        ...insertedExperience.toObject(),
        description: "This description has been updated."
      };

      const res = await request(app)
        .patch(`/experiences/${insertedExperience._id}`)
        .send(updatedExperience)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);
      
      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeDefined();
      expect(retrievedExperience?.description).toBe(updatedExperience.description);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should allow moderators to update experiences that aren't theirs", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser, makeModerator: true });
    
    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
      expect(insertedExperience.creatorId).not.toBe(testUser._id);

      const updatedExperience = {
        ...insertedExperience.toObject(),
        description: "This description has been updated."
      };

      const res = await request(app)
        .patch(`/experiences/${insertedExperience._id}`)
        .send(updatedExperience)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);
      
      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeDefined();
      expect(retrievedExperience?.description).toBe(updatedExperience.description);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should allow admins to update experiences that aren't theirs", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser, makeAdmin: true });
    
    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
      expect(insertedExperience.creatorId).not.toBe(testUser._id);
      
      const updatedExperience = {
        ...insertedExperience.toObject(),
        description: "This description has been updated."
      };

      const res = await request(app)
        .patch(`/experiences/${insertedExperience._id}`)
        .send(updatedExperience)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);

      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeDefined();
      expect(retrievedExperience?.description).toBe(updatedExperience.description);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should return a 400 code when attempting to update a record with an invalid id", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser, makeAdmin: true });

    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
      const updatedExperience = {
        ...insertedExperience.toObject(),
        _id: "111111111111",
        description: "This description has been updated."
      };

      const res = await request(app)
        .patch(`/experiences/${insertedExperience._id}`)
        .send(updatedExperience)
        .set("Content-Type", "application/json")
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(400);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });
});