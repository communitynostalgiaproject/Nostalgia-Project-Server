import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/customErrors";
import { Experience } from "@shared/types/experience";
import utils from "../utils/experienceUtils";

exports.createExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience: Experience = req.body;
    const savedExperience = await utils.createExperience(experience);

    res.status(200).send(savedExperience);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.getExperienceById = (req: Request, res: Response, next: NextFunction) => {
  // To do
  res.send("Route not yet implemented.");
};

exports.getExperiencesWithinBox = (req: Request, res: Response, next: NextFunction) => {
  // To do
  res.send("Route not yet implemented.");
};

exports.updateExperience = (req: Request, res: Response, next: NextFunction) => {
  // To do
  res.send("Route not yet implemented.");
};

exports.deleteExperience = (req: Request, res: Response, next: NextFunction) => {
  // To do
  res.send("Route not yet implemented.");``
};

export default exports;