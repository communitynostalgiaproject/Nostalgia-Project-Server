import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;


describe("PATCH /users", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = setupApp(uri);
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

  it("should return a 200 code upon success and should update the db record", async () => {
    const testUser = createUsers(1)[0];
    const insertedUser = await new UserModel(testUser).save();
    const updatedUser = {
      ...insertedUser.toObject(),
      isModerator: true
    };

    const res = await request(app).patch(`/users/${updatedUser._id}`).send(updatedUser);

    expect(res.status).toBe(200);
    
    const retrievedUser = await UserModel.findById(insertedUser._id);
    expect(retrievedUser?.toObject()).toEqual(updatedUser);
  });

  it("should return a 400 code when attempting to update a record with an invalid id", async () => {
    const testUser = createUsers(1)[0];
    const insertedUser = await new UserModel(testUser).save();
    const updatedUser = {
      ...insertedUser.toObject(),
      _id: "111111111111",
      isAdmin: true
    };

    const res = await request(app).patch(`/users/${updatedUser._id}`).send(updatedUser);

    expect(res.status).toBe(400);
  });
});