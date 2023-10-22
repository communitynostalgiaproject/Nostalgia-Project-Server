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

exports.getAllExperienceLocations = async () => {
  const experiences = await ExperienceModel.find({});
  const justLocations = experiences.map((experience) => ({
    location: experience.toObject().place.location
  }));

  return justLocations;
}

exports.getExperiencesWithinBox = async (lowerLeft: [number], upperRight: [number]) => {
  const experiences = await ExperienceModel.find({
    "place.location": {
      $geoWithin: {
        $box: [lowerLeft, upperRight]
      }
    }
  });
  console.log(`Experiences found within box: ${JSON.stringify(experiences.map(experience => experience.place.location.coordinates))}`);

  return experiences;
};

exports.updateExperience = async (experience: any) => {
  await ExperienceModel.updateOne(experience);
};

exports.deleteExperience = async (experienceId: ObjectId) => {
  const deleteResult = await ExperienceModel.deleteOne({ _id: experienceId });
};

export default exports;