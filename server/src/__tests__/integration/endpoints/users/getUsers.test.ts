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
    console.log("USER ARR", userArr)
    expect(res.status).toBe(200);
    expect(res.body).toEqual(userArr);
  });

//   it("should return a 500 code when attempting to update a record with an invalid id", async () => {
//     const testUser = createUsers(1)[0];
//     const insertedUser = await new UserModel(testUser).save();
//     const updatedUser = {
//       ...insertedUser.toObject(),
//       _id: "111111111111",
//       isAdmin: true
//     };

//     const res = await request(app).patch(`/users`).send(updatedUser);

//     expect(res.status).toBe(500);
//   });
});