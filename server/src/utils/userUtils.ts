import { ObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { ValidationError } from "./customErrors";

exports.createUser = async (newUser: any) => {
  const user = new UserModel(newUser);
  const savedUser = await user.save();

  return savedUser;
};

exports.getUsers = async (limit: number) => {
    
}

exports.getUserById = async (userId: string) => {
  const user = await UserModel.findById(userId);

  return user;
};

exports.getExperiencesWithinBox = async (lowerLeft: [number], upperRight: [number], locationsOnly: boolean) => {
  const experiences = locationsOnly ? 
    await UserModel.find({
      "place.location": {
        $geoWithin: {
          $box: [lowerLeft, upperRight]
        }
      }
    }).select("place.location -_id")
  : await UserModel.find({
      "place.location": {
        $geoWithin: {
          $box: [lowerLeft, upperRight]
        }
      }
    });

  return experiences;
};

exports.updateExperience = async (experience: any) => {
  await UserModel.updateOne(experience);
};

exports.deleteExperience = async (experienceId: ObjectId) => {
  await UserModel.deleteOne({ _id: experienceId });
};

exports.convertBbox = (bbox: string | undefined) => {
  if (!bbox) {
    throw(new ValidationError("Missing bbox query parameter"));
  }
  const nums = bbox.split(",").map((coord: string) => Number(coord));
  if (nums.length !== 4) {
    throw(new ValidationError("Invalid bbox query parameter"));
  }

  return {
    lowerLeft: [nums[0], nums[1]],
    upperRight: [nums[2], nums[3]]
  };
};

export default exports;