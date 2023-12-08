import mongoose from "mongoose";
import ExperienceModel from "../../../models/experience.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import experienceUtils from "../../../utils/experienceUtils";
import { createExperiences } from "../../../utils/testDataGen";
import { faker } from "@faker-js/faker";
import { ObjectId } from "mongodb";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const conUri = mongoServer.getUri();
  await mongoose.connect(conUri);
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

describe("Experience utils test", () => {
  // Create
  it("successfully creates an experience", async () => {
    const testExperience = {
      title: "Test title",
      place: {
        address: { someProperty: "value" },
        location: {
          type: "Point",
          coordinates: [125.6, 10.1]
        }
      },
      description: "Test description",
      experienceDate: "2023-10-12",
      creatorId: new ObjectId(32624634634)
    };
    const newExperience = await experienceUtils.createExperience(testExperience);
    
    expect(newExperience._id).toBeDefined();
    expect(newExperience.title).toBe(testExperience.title);
    expect(newExperience.description).toBe(testExperience.description);
    expect(newExperience.experienceDate).toBe(testExperience.experienceDate);
    expect(newExperience.createdDate.split("T")[0]).toBe((new Date).toISOString().split("T")[0]);
  });

  it("fails to create new experience if given invalid object", async () => {
    const testExperience = {
      title: "Test title",
      description: "Test description",
      experienceDate: "2023-10-12"
    };
    await expect(async () => {
      await experienceUtils.createExperience(testExperience);
    }).rejects.toThrow();
  });

  // Read
  it("gets an experience by ID", async () => {
    const testExperience = await new ExperienceModel(createExperiences(1)[0]).save();

    const retrievedExperience = await experienceUtils.getExperienceById(testExperience._id);
    expect(retrievedExperience).toBeDefined();
  });

  it("should only retrieve experiences within the specified GeoJSON bounding box", async () => {
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

    const retrievedExperiences = await experienceUtils.getExperiencesWithinBox(
      boundingBox.lowerLeft,
      boundingBox.upperRight
    );
    expect(retrievedExperiences.length).toBe(Math.floor(numExperiences / 2));
  });

  it("should only retrieve locations for experiences within the GeoJSON bounding box when specified", async () => {
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

    const retrievedExperiences = await experienceUtils.getExperiencesWithinBox(
      boundingBox.lowerLeft,
      boundingBox.upperRight,
      true
    );
    expect(retrievedExperiences.length).toBe(Math.floor(numExperiences / 2));
    retrievedExperiences.forEach((experience: any) => {
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

  // Update
  it("successfully updates an experience", async () => {
    const randomExperience = createExperiences(1)[0];
    const originalExperience = await new ExperienceModel(randomExperience).save();
    expect(originalExperience._id).toBeDefined();

    await experienceUtils.updateExperience({
      ...originalExperience.toObject(),
      description: "Updated description"
    });
    const updatedExperience = await ExperienceModel.findById(originalExperience._id);
    expect(updatedExperience).toBeDefined();
    expect(updatedExperience?.description).not.toBe(originalExperience.description);
  });

  it("fails to update an experience with invalid values", async () => {
    const randomExperience = createExperiences(1)[0];
    await new ExperienceModel(randomExperience).save();

    await expect(experienceUtils.updateExperience({
      ...randomExperience,
      place: {
        address: {
          name: "Nowhere"
        },
        location: {
          type: "Not a point",
          coordinates: [
            [45, 67, 34],
            [2, 2, 2, 2]
          ]
        }
      }
    })).rejects.toThrow();
  });

  // Delete
  it("deletes a specified experience", async () => {
    const randomExperience = createExperiences(1)[0];
    const testExperience = await new ExperienceModel(randomExperience).save();
    expect(testExperience._id).toBeDefined();

    await experienceUtils.deleteExperience(testExperience._id);
    const retrievedExperience = await ExperienceModel.findById(testExperience._id);
    expect(retrievedExperience).toBeNull();
  });
});