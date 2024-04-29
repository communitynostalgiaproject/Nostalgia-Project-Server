import  mongoose from "mongoose";
import { createUsers, createExperiences, createFlags } from "./testDataGen";
import ExperienceModel from "../models/experience.model";
import UserModel from "../models/user.model";
import FlagModel from "../models/flag.model";
import ConfigurationModel from "../models/configuration.model";
import dotenv from "dotenv";
import connectDB from "../config/mongodbSetup";

dotenv.config();

// Todo: Get numbers of objects from command line arguments
const numUsers = 500;
const numExperiences = 1500;
const numFlags = 150;

connectDB(process.env.MONGODB_URI as string);

async function seedData() {
  const existingUserCount = await UserModel.countDocuments();
  const existingExperienceCount = await ExperienceModel.countDocuments();
  const existingFlagCount = await FlagModel.countDocuments();

  if (existingUserCount > 0 || existingExperienceCount > 0 || existingFlagCount > 0) {
    console.log("Data already exists in the database. Skipping seeding.");
    mongoose.disconnect();
    return;
  }

  // Generate data
  const users = createUsers(numUsers);
  const insertedUsers = await UserModel.insertMany(users);

  const experiences = createExperiences(numExperiences, insertedUsers.map((user: any) => user._id));
  const insertedExperiences = await ExperienceModel.insertMany(experiences);

  const flags = createFlags(
    numFlags,
    insertedExperiences.map((experience: any) => experience._id),
    insertedUsers.map((user: any) => user._id)
  );
  await FlagModel.insertMany(flags);

  console.log("Database seeded successfully!");
  mongoose.disconnect();
}

seedData().catch(err => {
  console.error("Error seeding the database:", err);
  mongoose.disconnect();
});
