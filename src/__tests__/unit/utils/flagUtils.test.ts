import mongoose from "mongoose";
import FlagModel from "../../../models/flag.model";
import ExperienceModel from "../../../models/experience.model";
import UserModel from "../../../models/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import utils from "../../../utils/flagUtils";
import { createExperiences, createUsers, createFlags } from "../../../utils/testDataGen";
import { Experience } from "@projectTypes/experience";
import { User } from "@projectTypes/user";
import { randomInt } from "crypto";
import { Flag } from "@projectTypes/flag";
import { DEFAULT_LIMIT } from "../../../config/constants";

let mongoServer: MongoMemoryServer;
let testUsers: User[];
let testExperiences: Experience[];

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);

  testUsers = await UserModel.insertMany(createUsers(5));
  testExperiences = await ExperienceModel.insertMany(createExperiences(10, testUsers.map((user: User) => `${user._id}`)));
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
})

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    mongoServer.stop();
  }
});

describe("Flag utils test", () => {
  // Create
  it("successfully creates a flag", async () => {
    const testFlag = createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0];
    const newFlag = await utils.createFlag(testFlag);
    
    expect(newFlag?._id).toBeDefined();
    expect(newFlag?.contentId.toString()).toBe(testFlag.contentId);
    expect(newFlag?.contentType).toBe(testFlag.contentType);
    expect(newFlag?.userId.toString()).toBe(testFlag.userId);
    expect(newFlag?.priority).toBe(testFlag.priority);
    expect(newFlag?.reason).toBe(testFlag.reason);
    expect(newFlag?.userComment).toBe(testFlag.userComment);
    expect(newFlag?.resolved).toBe(testFlag.resolved);
  });

  it("fails to create new flag if given invalid object", async () => {
    const testFlag = {
      contentId: "111111111111",
      contentType: "Banana",
      priority: "severe"
    };
    await expect(async () => {
      await utils.createFlag(testFlag);
    }).rejects.toThrow();
  });

  // Read
  it("gets a flag by ID", async () => {
    const testFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();

    const retrievedExperience = await utils.getFlagById(testFlag._id);
    expect(retrievedExperience).toBeDefined();
  });

  it("should only retrieve flags for the specified experience", async () => {
    const numFlags = 15;
    const numTargets = 5;
    const targetExperienceId = testExperiences[randomInt(testExperiences.length)]._id?.toString();
    const nonTargetExperienceIds = testExperiences.filter((experience: Experience) => experience._id?.toString() !== targetExperienceId);
    const randomFlags = createFlags(
      numFlags,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    randomFlags.forEach((flag: any, i: number) => {
      if (i < numTargets) {
        flag.contentId = targetExperienceId;
      } else {
        flag.contentId = nonTargetExperienceIds[randomInt(nonTargetExperienceIds.length)];
      }
    });
    await FlagModel.insertMany(randomFlags);

    const retrievedFlags = await utils.getFlags({
      contentId: targetExperienceId
    });

    expect(retrievedFlags.length).toBe(numTargets);
    retrievedFlags.forEach((flag: Flag) => {
      expect(flag.contentId?.toString()).toBe(targetExperienceId);
    });
  });

  it("should only retrieve number of flags specified in limit param", async () => {
    const numFlags = 25;
    const limit = 10;
    const randomFlags = createFlags(
      numFlags,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(randomFlags);

    const retrievedFlags = await utils.getFlags({
      limit
    });

    expect(retrievedFlags.length).toBe(limit);
  });

  it("should retrieve the correct subset of records when using limit and offset params", async () => {
    const numFlags = 20;
    const limit = 5;
    const randomFlags = createFlags(
      numFlags,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(randomFlags);

    const allFlags = await utils.getFlags({});

    expect(allFlags.length).toBe(numFlags);

    for (let i = 0; i < Math.ceil(numFlags / limit); i++) {
      const subset = await utils.getFlags({
        limit,
        offset: i * limit
      });

      expect(subset.length).toBe(limit);
      subset.forEach((flag: Flag, j: number) => {
        expect(flag._id?.toString()).toBe(allFlags[limit * i + j]._id?.toString());
      });
    }
  });

  it("should retrieve DEFAULT_LIMIT records if there are enough records and no limit is specified", async () => {
    const randomFlags = createFlags(
      DEFAULT_LIMIT * 2,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    );
    await FlagModel.insertMany(randomFlags);

    const allFlags = await utils.getFlags({});

    expect(allFlags.length).toBe(DEFAULT_LIMIT);
  });

  // Update
  it("successfully updates a flag", async () => {
    const originalFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();

    await utils.updateFlag({
      ...originalFlag,
      resolved: true,
      resolvedBy: testUsers[randomInt(testUsers.length)]._id
    });

    const updatedFlag = await FlagModel.findById(originalFlag._id);

    expect(updatedFlag).toBeDefined();
    expect(updatedFlag?.resolved).toBe(originalFlag.resolved);
    expect(updatedFlag?.resolvedBy?.toString()).toBe(originalFlag.resolvedBy?.toString());
  });

  // Delete
  it("deletes a specified flag", async () => {
    const testFlag = await new FlagModel(createFlags(
      1,
      testExperiences.map((experience: Experience) => `${experience._id}`),
      testUsers.map((user: User) => `${user._id}`)
    )[0]).save();
    expect(testFlag._id).toBeDefined();

    await utils.deleteFlag(testFlag._id);

    const retrievedFlag = await FlagModel.findById(testFlag._id);
    expect(retrievedFlag).toBeNull();
  });
});