import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("DELETE /users/{userId}", () => {
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

  it("should return a 200 code upon success and should delete the db record", async () => {
    const testUser = createUsers(1)[0];
    const insertedUser = await new UserModel(testUser).save();

    const res = await request(app).delete(`/users/${insertedUser._id}`);

    expect(res.status).toBe(200);
    
    const retrievedUser = await UserModel.findById(insertedUser._id);
    expect(retrievedUser).toBeNull();
  });

  it("should return a 400 code if given an invalid ID", async () => {
    const res = await request(app).delete(`/users/1234`);

    expect(res.status).toBe(400);
  });
});