import request from "supertest";
import { setupApp } from "../../../../config/app";
import { createExperiences } from "../../../../utils/testDataGen";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Express } from "express";
import mongoose from "mongoose";
import ExperienceModel from "../../../../models/experience.model";
import { faker } from "@faker-js/faker";

let mongoServer: MongoMemoryServer;
let app: Express;

describe("GET /experiences/withinBox", () => {
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

  it("should return a 200 code and all data for all experiences within the given bounding box when locationsOnly param is omitted", async () => {
    const numExperiences = 11;
    const randomExperiences = createExperiences(numExperiences);
    const boundingBox = {
      lowerLeft: [0, 0],
      upperRight: [20, 20]
    }
    // Put odd-indexed experiences inside the bounding box and the evens outside
    randomExperiences.forEach((experience, i) => {
      if (i % 2) {
        experience.place.location.coordinates = [
          faker.location.longitude({
            min: boundingBox.lowerLeft[1] + 1,
            max: boundingBox.upperRight[1] - 1,
            precision: 4
          }),
          faker.location.latitude({
            min: boundingBox.lowerLeft[0] + 1,
            max: boundingBox.upperRight[0] - 1,
            precision: 4
          })
        ];
      } else {
        experience.place.location.coordinates = [
          faker.location.longitude({
            min: -180,
            max: boundingBox.lowerLeft[1] - 1,
            precision: 4
          }),
          faker.location.latitude({
            min: -90,
            max: boundingBox.lowerLeft[0] - 1,
            precision: 4
          })
        ];
      }
    });
    await ExperienceModel.insertMany(randomExperiences);

    const res = await request(app).get(`/experiences/withinBox?bbox=0,0,20,20`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(Math.floor(numExperiences / 2));
    res.body.forEach((experience: any) => {
      expect(experience.place).toBeDefined();
      expect(experience.place.location).toBeDefined();
      expect(experience._id).toBeDefined();
      expect(experience.title).toBeDefined();
      expect(experience.description).toBeDefined();
      expect(experience.createdDate).toBeDefined();
    });
  });

  it("should return a 200 code and just location data for all experiences within the given bounding box when locationsOnly=true", async () => {
    const numExperiences = 11;
    const randomExperiences = createExperiences(numExperiences);
    const boundingBox = {
      lowerLeft: [0, 0],
      upperRight: [20, 20]
    }
    // Put odd-indexed experiences inside the bounding box and the evens outside
    randomExperiences.forEach((experience, i) => {
      if (i % 2) {
        experience.place.location.coordinates = [
          faker.location.longitude({
            min: boundingBox.lowerLeft[1] + 1,
            max: boundingBox.upperRight[1] - 1,
            precision: 4
          }),
          faker.location.latitude({
            min: boundingBox.lowerLeft[0] + 1,
            max: boundingBox.upperRight[0] - 1,
            precision: 4
          })
        ];
      } else {
        experience.place.location.coordinates = [
          faker.location.longitude({
            min: -180,
            max: boundingBox.lowerLeft[1] - 1,
            precision: 4
          }),
          faker.location.latitude({
            min: -90,
            max: boundingBox.lowerLeft[0] - 1,
            precision: 4
          })
        ];
      }
    });
    await ExperienceModel.insertMany(randomExperiences);

    const res = await request(app).get(`/experiences/withinBox?bbox=0,0,20,20&locationsOnly=true`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(Math.floor(numExperiences / 2));
    res.body.forEach((experience: any) => {
      expect(experience.place).toBeDefined();
      expect(experience.place.location).toBeDefined();
      expect(experience._id).not.toBeDefined();
      expect(experience.title).not.toBeDefined();
      expect(experience.description).not.toBeDefined();
      expect(experience.recipe).not.toBeDefined();
      expect(experience.experienceDate).not.toBeDefined();
      expect(experience.createdDate).not.toBeDefined();
      expect(experience.mood).not.toBeDefined();
      expect(experience.foodtype).not.toBeDefined();
      expect(experience.personItRemindsThemOf).not.toBeDefined();
      expect(experience.flavourProfile).not.toBeDefined();
      expect(experience.periodOfLifeAssociation).not.toBeDefined();
      expect(experience.placesToGetFood).not.toBeDefined();
      expect(experience.creatorId).not.toBeDefined();
    });
  });

  it("should return a 200 code and an empty list when no experiences exist within the given bounding box", async () => {
    const randomExperiences = createExperiences(30);
    const boundingBox = {
      lowerLeft: [0, 0],
      upperRight: [20, 20]
    }
    // Put odd-indexed experiences inside the bounding box and the evens outside
    randomExperiences.forEach((experience) => {
      experience.place.location.coordinates = [
        faker.location.longitude({
          min: -180,
          max: boundingBox.lowerLeft[1] - 1,
          precision: 4
        }),
        faker.location.latitude({
          min: -90,
          max: boundingBox.lowerLeft[0] - 1,
          precision: 4
        })
      ];
    });
    await ExperienceModel.insertMany(randomExperiences);

    const res = await request(app).get(`/experiences/withinBox?bbox=0,0,20,20`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("should return a 400 code when called without bbox param", async () => {
    const res = await request(app).get(`/experiences/withinBox`);

    expect(res.status).toBe(400);
  });

  it("should return a 400 code when called with an invalid bbox param", async () => {
    // Too many numbers
    const res1 = await request(app).get(`/experiences/withinBox?bbox=10,20,3,2,1,23`);

    expect(res1.status).toBe(400);

    // Not enough numbers
    const res2 = await request(app).get(`/experiences/withinBox?bbox=10,20`);

    expect(res2.status).toBe(400);
  });
});