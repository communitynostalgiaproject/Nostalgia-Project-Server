import mongoose from "mongoose";
import ConfigurationModel from "../models/configuration.model";
import dotenv from "dotenv";
import connectDB from "../config/mongodbSetup";

dotenv.config();

connectDB(process.env.MONGODB_URI as string);

async function setupConfig() {
  const imgurAccessToken = process.env.IMGUR_ACCESS_TOKEN;
  const imgurRefreshToken = process.env.IMGUR_REFRESH_TOKEN;

  if (!(imgurAccessToken && imgurRefreshToken)) {
    console.error("Imgur tokens not found")
  }

  await ConfigurationModel.create({
    key: "IMGUR_ACCESS_TOKEN",
    value: imgurAccessToken
  });

  await ConfigurationModel.create({
    key: "IMGUR_REFRESH_TOKEN",
    value: imgurRefreshToken
  });

  console.log("Configurations added to database.");
}

setupConfig().catch(err => {
  console.error("Error setting Imgur tokens in DB:", err);
  mongoose.disconnect();
});
