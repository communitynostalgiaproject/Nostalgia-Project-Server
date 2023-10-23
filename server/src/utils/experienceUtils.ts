import { ObjectId } from "mongoose";
import ExperienceModel from "../models/experience.model";

exports.createExperience = async (newExperience: any) => {
  const experience = new ExperienceModel(newExperience);
  const savedExperience = await experience.save();

  return savedExperience;
};

exports.getExperienceById = async (experienceId: string) => {
  const experience = await ExperienceModel.findById(experienceId);

  return experience;
};

exports.getExperiencesWithinBox = async (lowerLeft: [number], upperRight: [number], locationsOnly=false) => {
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
  const deleteResult = await ExperienceModel.deleteOne({ _id: experienceId });
};

export default exports;