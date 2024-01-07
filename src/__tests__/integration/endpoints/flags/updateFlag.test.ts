import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences, createUsers, createFlags } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import { Experience } from "@projectTypes/experience";
import { User } from "@projectTypes/user";
import ExperienceModel from "../../../../models/experience.model";
import UserModel from "../../../../models/user.model";
import FlagModel from "../../../../models/flag.model";
import { performLogin, performLogout, upgradePermissions } from "../../../../utils/testUtils";

let mongoServer: MongoMemoryServer;
let app: Express;
let testExperiences: Experience[];
let testUsers: User[];

describe("PATCH /flags", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);

    testUsers = await UserModel.insertMany(createUsers(5));
    testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("returns a 401 code when the user is not logged in", async () => {
    const testFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();
    expect(testFlag._id).toBeDefined();
    const updatedFlag = {
      ...testFlag.toObject(),
      userComment: "This is a test user comment"
    }

    const res = await request(app)
      .patch(`/flags/${testFlag._id}`)
      .send(updatedFlag);

    expect(res.status).toBe(401);
  });

  it("returns a 403 code when the user does not have permission", async () => {
    const { sessionCookie, testUser } = await performLogin(app);

    try {
      const testFlag = await new FlagModel(createFlags(
        1,
        testExperiences.map((experience: Experience) => `${experience._id}`),
        testUsers.map((user: User) => `${user._id}`)
      )[0]).save();
      expect(testFlag._id).toBeDefined();
      expect(testUser.isModerator).toBe(false);
      expect(testUser.isAdmin).toBe(false);
      const updatedFlag = {
        ...testFlag.toObject(),
        userComment: "This is a test user comment"
      }
  
      const res = await request(app)
        .patch(`/flags/${testFlag._id}`)
        .send(updatedFlag)
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

  it("updates the record and returns a 200 code if user is a moderator", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser,  makeModerator: true });

    try {
      const testFlag = await new FlagModel(createFlags(
        1,
        testExperiences.map((experience: Experience) => `${experience._id}`),
        testUsers.map((user: User) => `${user._id}`)
      )[0]).save();
      expect(testFlag._id).toBeDefined();
      const updatedFlag = {
        ...testFlag.toObject(),
        userComment: "This is a test user comment"
      }
  
      const res = await request(app)
        .patch(`/flags/${testFlag._id}`)
        .send(updatedFlag)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
  
      const retrievedFlag = await FlagModel.findById(testFlag._id);
      expect(retrievedFlag?.userComment).toBe(updatedFlag.userComment);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });

  it("updates the record and returns a 200 code if user is an admin", async () => {
    const { sessionCookie, testUser } = await performLogin(app);
    await upgradePermissions(app, { testUser,  makeAdmin: true });

    try {
      const testFlag = await new FlagModel(createFlags(
        1,
        testExperiences.map((experience: Experience) => `${experience._id}`),
        testUsers.map((user: User) => `${user._id}`)
      )[0]).save();
      expect(testFlag._id).toBeDefined();
      const updatedFlag = {
        ...testFlag.toObject(),
        userComment: "This is a test user comment"
      }
  
      const res = await request(app)
        .patch(`/flags/${testFlag._id}`)
        .send(updatedFlag)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(200);
  
      const retrievedFlag = await FlagModel.findById(testFlag._id);
      expect(retrievedFlag?.userComment).toBe(updatedFlag.userComment);
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
    await upgradePermissions(app, { testUser,  makeAdmin: true });

    try {
      const testFlag = await new FlagModel(createFlags(
        1,
        testExperiences.map((experience: Experience) => `${experience._id}`),
        testUsers.map((user: User) => `${user._id}`)
      )[0]).save();
      const updatedFlag = {
        ...testFlag.toObject(),
        _id: "111111111111",
        userComment: "This user comment has been updated"
      };
  
      const res = await request(app)
        .patch(`/flags/${testFlag._id}`)
        .send(updatedFlag)
        .set("Cookie", sessionCookie);
  
      expect(res.status).toBe(400);
    } catch(err) {
      console.log(`sessionCookie: ${sessionCookie}`);
      console.log(`testUser: ${JSON.stringify(testUser)}`);
      throw err;
    } finally {
      await performLogout(app, testUser._id);
    }
  });
});