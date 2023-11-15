import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences, createUsers, createFlags } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import { Experience } from "@shared/types/experience";
import { User } from "@shared/types/user";
import ExperienceModel from "../../../../models/experience.model";
import UserModel from "../../../../models/user.model";
import FlagModel from "../../../../models/flag.model";
import { DEFAULT_LIMIT } from "../../../../config/constants";
import { randomInt } from "crypto";
import { Flag } from "@shared/types/flag";
import { faker } from "@faker-js/faker";

let mongoServer: MongoMemoryServer;
let app: Express;
let testExperiences: Experience[];
let testUsers: User[];

describe("GET /flags", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    app = setupApp(uri);

    testUsers = await UserModel.insertMany(createUsers(5));
    testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
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

  it("returns a 200 code and DEFAULT_LIMIT records if there are enough records and no other params are specified", async () => {
    const testFlags = createFlags(
      DEFAULT_LIMIT * 2,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);


    const res = await request(app).get(`/flags`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(DEFAULT_LIMIT);
  });

  it("returns a 200 code and array with 'limit' records if specified", async () => {
    const limit = 12
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);


    const res = await request(app).get(`/flags?limit=${limit}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(limit);
  });

  it("returns a 200 code and the correct subset of objects when limit and offset are defined", async () => {
    const limit = 5;
    const offset = 8;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);

    const allFlags = await FlagModel.find({}); 

    const res = await request(app).get(`/flags?limit=${limit}&offset=${offset}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(limit);
    for (let i = 0; i < limit; i++) {
      expect(res.body[i]._id.toString()).toBe(allFlags[offset + i]._id.toString());
    }
  });

  it("returns a 200 code and only flags with the specified contentId", async () => {
    const numTarget = 5;
    const targetExperienceId = testExperiences[randomInt(testExperiences.length)]._id?.toString();
    const nonTargetExperienceIds = testExperiences
      .filter((experience: Experience) => experience._id?.toString() !== targetExperienceId)
      .map((experience: Experience) => experience._id?.toString());
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.contentId = i < numTarget ? targetExperienceId : nonTargetExperienceIds[randomInt(nonTargetExperienceIds.length)]
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?contentId=${targetExperienceId}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numTarget);
    res.body.forEach((flag: Flag) => {
      expect(flag.contentId.toString()).toBe(targetExperienceId);
    });
  });

  it("returns a 200 code and only flags with the specified userId", async () => {
    const numTarget = 5;
    const targetUserId = testExperiences[randomInt(testUsers.length)]._id?.toString();
    const nonTargetUserIds = testUsers
      .filter((user: User) => user._id?.toString() !== targetUserId)
      .map((user: User) => user._id?.toString());
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.userId = i < numTarget ? targetUserId : nonTargetUserIds[randomInt(nonTargetUserIds.length)]
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?userId=${targetUserId}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numTarget);
    res.body.forEach((flag: Flag) => {
      expect(flag.userId.toString()).toBe(targetUserId);
    });
  });

  it("returns a 200 code and flags created before a specified date", async () => {
    const randomDate = faker.date.anytime();
    const numBefore = 10;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.createdDate = i < numBefore ? 
        faker.date.past({ refDate: randomDate })
        : faker.date.future({ refDate: randomDate });
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?createdBefore=${randomDate.toISOString()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numBefore);
    res.body.forEach((flag: Flag) => {
      expect(new Date(flag.createdDate).getTime()).toBeLessThan(randomDate.getTime());
    });
  });

  it("returns a 200 code and flags created after a specified date", async () => {
    const randomDate = faker.date.anytime();
    const numAfter = 10;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.createdDate = i < numAfter ? 
        faker.date.future({ refDate: randomDate })
        : faker.date.past({ refDate: randomDate });
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?createdAfter=${randomDate.toISOString()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numAfter);
    res.body.forEach((flag: Flag) => {
      expect(new Date(flag.createdDate).getTime()).toBeGreaterThan(randomDate.getTime());
    });
  });

  it("returns a 200 code and flags created between two specified dates", async () => {
    const randomStartDate = faker.date.anytime();
    const randomEndDate = faker.date.future({ refDate: randomStartDate });
    const numBetween = 6;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.createdDate = i < numBetween ? 
        faker.date.between({
          from: randomStartDate,
          to: randomEndDate
        })
        : Math.random() < 0.5 
        ? faker.date.past({ refDate: randomStartDate }) 
        : faker.date.future({ refDate: randomEndDate });
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?createdAfter=${randomStartDate.toISOString()}&createdBefore=${randomEndDate.toISOString()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numBetween);
    res.body.forEach((flag: Flag) => {
      expect(new Date(flag.createdDate).getTime()).toBeGreaterThan(randomStartDate.getTime());
      expect(new Date(flag.createdDate).getTime()).toBeLessThan(randomEndDate.getTime());
    });
  });

  it("returns a 200 code and flags with the specified priority value", async () => {
    const possiblePriorities = ["low", "medium", "high"];
    const targetPriority = possiblePriorities[randomInt(possiblePriorities.length)];
    const numTarget = 10;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.priority = i < numTarget ? 
        targetPriority
        : possiblePriorities
            .filter((val: string) => val !== targetPriority)[randomInt(possiblePriorities.length - 1)];
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?priority=${targetPriority}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numTarget);
    res.body.forEach((flag: Flag) => {
      expect(flag.priority).toBe(targetPriority);
    });
  });

  it("returns a 200 code and flags with the specified reason value", async () => {
    const possibleReasons = ["spam", "hate-speech", "misinformation"];
    const targetReason = possibleReasons[randomInt(possibleReasons.length)];
    const numTarget = 10;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.priority = i < numTarget ? 
      targetReason
        : possibleReasons
            .filter((val: string) => val !== targetReason)[randomInt(possibleReasons.length - 1)];
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?priority=${targetReason}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numTarget);
    res.body.forEach((flag: Flag) => {
      expect(flag.priority).toBe(targetReason);
    });
  });

  it("returns a 200 code and flags with the specified resolution status", async () => {
    const targetStatus = Math.random() < 0.5;
    const numTarget = 10;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    testFlags.forEach((flag: any, i: number) => {
      flag.resolved = i < numTarget ? targetStatus : !targetStatus;
    });
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?resolved=${targetStatus}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(numTarget);
    res.body.forEach((flag: Flag) => {
      expect(flag.resolved).toBe(targetStatus);
    });
  });

  it("returns a 200 code and an empty list if unknown parameter is passed", async () => {
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?parsnips=true`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("returns a 200 code and ignores invalid limit param", async () => {
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);

    const res = await request(app).get(`/flags?limit=-1`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(DEFAULT_LIMIT);
  });

  it("returns a 200 code and ignores invalid offset param", async () => {
    const limit = 5;
    const offset = -3;
    const testFlags = createFlags(
      DEFAULT_LIMIT,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(testFlags);

    const allFlags = await FlagModel.find({}); 

    const res = await request(app).get(`/flags?limit=${limit}&offset=${offset}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(limit);
    for (let i = 0; i < limit; i++) {
      expect(res.body[i]._id.toString()).toBe(allFlags[i]._id.toString());
    }
  });
});