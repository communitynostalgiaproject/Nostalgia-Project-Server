import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createUsers } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import UserModel from "../../../../models/user.model";

let mongoServer: MongoMemoryServer;
let app: Express;

const convertValueToString: any = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (obj instanceof mongoose.Types.ObjectId) return obj.toString();

  if (Array.isArray(obj)) return obj.map(convertValueToString);

  const result: { [key: string]: any } = {};

  for (let key in obj) {
    switch(key) {
        case "_id":
            result[key] = obj[key].toString();
            break;
        case "joinedDate":
            result[key] = obj[key].toISOString();
            break;
        default:
            result[key] = convertValueToString(obj[key]);
    }
  }
  return result;
}


describe("GET /users", () => {
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

  it("should return a 200 code upon successfully returning all users without the 'limit' query param", async () => {
    const testUsers = createUsers(6);
    const insertedUsers = await UserModel.insertMany(testUsers);

    let userArr = [];
    for (let userObj of insertedUsers) {
      let user = convertValueToString(userObj.toObject());
      userArr.push(user);
    }
    
    const res = await request(app).get(`/users`);
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual(userArr);
  });

  it("should return a 200 code when successfully returning a limited amount of users", async () => {
    const testUsers = createUsers(6);
    await UserModel.insertMany(testUsers);
    
    const res = await request(app)
    .get(`/users`)
    .query({limit: 2});
    
    expect(res.status).toBe(200);
    expect(res.body.length).toEqual(2);
  });

  it("should return a 500 if an invalid value is passed as a limit query param", async () => {
    const testUsers = createUsers(6);
    await UserModel.insertMany(testUsers);

    const res = await request(app)
    .get(`/users`)
    .query({limit: "c"});
    
    expect(res.status).toBe(500);
  })
});