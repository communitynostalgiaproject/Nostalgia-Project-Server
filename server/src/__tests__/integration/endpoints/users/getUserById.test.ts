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


describe("GET /users/{userId}", () => {

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

    it("should return a 200 code and the requested record if found", async () => {
        const testUser = createUsers(1)[0];
        const insertedUser = await new UserModel(testUser).save();

        const res = await request(app)
        .get(`/users`)
        .query({userId: insertedUser._id});

        expect(res.status).toBe(200);
        expect(res.body[0]).toEqual(convertValueToString(insertedUser.toObject()));
    });

    it("should return a 404 code if user with provided id doesn't exist", async () => {
        const res = await request(app).get(`/users/653d57c56be3d6d264edda2`)

        expect(res.status).toBe(404);
    });
});