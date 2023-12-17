import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;
let app: Express;

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
}

describe("POST /users", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should return a 201 code and copy of created record on success", async () => {
    const testUser = createUsers(1)[0];

    // Converting from date object in 'testUser.joinedDate' to an ISO string to account for res object format.
    const dateStr = testUser.joinedDate.toISOString();
 
    const res = await request(app)
      .post("/users")
      .send(testUser)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(removeMongooseDocFields(res.body)).toEqual({...testUser, joinedDate: dateStr, firstLogin: true});
  });

  it("should return a 400 code if invalid object was submitted", async () => {
    const testUser = {
      displayName: "Test User1"
    };

    const res = await request(app)
      .post("/users")
      .send(testUser)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
  });
});