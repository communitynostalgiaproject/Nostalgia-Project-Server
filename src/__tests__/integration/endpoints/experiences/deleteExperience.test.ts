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

describe("DELETE /experiences/{experienceId}", () => {
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
    const testExperience = createExperiences(1)[0];
    const insertedExperience = await new ExperienceModel(testExperience).save();

    const res = await request(app).delete(`/experiences/${insertedExperience._id}`);

    expect(res.status).toBe(401);
  });

  it("should return a 403 code if user does not have permission", async () => {
    const { sessionCookie, testUser } = await performLogin(app);

    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
  
      expect(insertedExperience._id).not.toBe(testUser._id);
  
      const res = await request(app)
        .delete(`/experiences/${insertedExperience._id}`)
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
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel({
        ...testExperience,
        creatorId: testUser._id
      }).save();

      const res = await request(app)
        .delete(`/experiences/${insertedExperience._id}`)
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);
      
      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeNull();
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser);
    }
  });

  it("should let a moderator delete an experience that is not theirs", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser, makeModerator: true });

    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();
  
      expect(insertedExperience._id).not.toBe(testUser._id);
  
      const res = await request(app)
        .delete(`/experiences/${insertedExperience._id}`)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
      
      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeNull();
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should let an admin delete an experience that is not theirs", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser, makeAdmin: true });

    try {
      const testExperience = createExperiences(1)[0];
      const insertedExperience = await new ExperienceModel(testExperience).save();

      expect(insertedExperience._id).not.toBe(testUser._id);

      const res = await request(app)
        .delete(`/experiences/${insertedExperience._id}`)
        .set("Cookie", sessionCookie);

      expect(res.status).toBe(200);
      
      const retrievedExperience = await ExperienceModel.findById(insertedExperience._id);
      expect(retrievedExperience).toBeNull();
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("should return a 400 code if given an invalid ID", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    upgradePermissions(app, { testUser, makeAdmin: true });

    try {
      const res = await request(app)
        .delete(`/experiences/1234`)
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