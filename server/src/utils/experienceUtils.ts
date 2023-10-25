import { ObjectId } from "mongoose";
import ExperienceModel from "../models/experience.model";
import { ValidationError } from "./customErrors";

exports.createExperience = async (newExperience: any) => {
  const experience = new ExperienceModel(newExperience);
  const savedExperience = await experience.save();

  return savedExperience;
};

exports.getExperienceById = async (experienceId: string) => {
  const experience = await ExperienceModel.findById(experienceId);

  return experience;
};

exports.getExperiencesWithinBox = async (lowerLeft: [number], upperRight: [number], locationsOnly: boolean) => {
  const experiences = locationsOnly ? 
    await ExperienceModel.find({
      "place.location": {
        $geoWithin: {
          $box: [lowerLeft, upperRight]
        }
      }
    }).select("place.location -_id")
  : await ExperienceModel.find({
      "place.location": {
        $geoWithin: {
          $box: [lowerLeft, upperRight]
        }
      }
    });

  return experiences;
};

exports.updateExperience = async (experience: any) => {
  await ExperienceModel.updateOne(experience);
};

exports.deleteExperience = async (experienceId: ObjectId) => {
  await ExperienceModel.deleteOne({ _id: experienceId });
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