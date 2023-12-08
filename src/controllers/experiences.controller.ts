import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/customErrors";
import { Experience } from "@projectTypes/experience";
import utils from "../utils/experienceUtils";

exports.createExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Inside create experience handler!`);
    console.log(`req.headers: ${JSON.stringify(req.headers)}`);
    console.log(`req.user: ${JSON.stringify(req.user)}`);

    const experience: Experience = req.body;
    const savedExperience = await utils.createExperience(experience);

    res.status(200).send(savedExperience);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.getExperienceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { experienceId } = req.params;
    const experience = await utils.getExperienceById(experienceId);

    res.status(200).send(experience);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.getExperiencesWithinBox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bbox, locationsOnly } = req.query;
    const { lowerLeft, upperRight } = utils.convertBbox(bbox);
    const experiences = await utils.getExperiencesWithinBox(lowerLeft, upperRight, locationsOnly ? true : false);

    res.status(200).send(experiences);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.updateExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience: Experience = req.body;
    await utils.updateExperience(experience);

    res.status(200).send();
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.deleteExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { experienceId } = req.params;
    await utils.deleteExperience(experienceId);

    res.status(200).send();
  } catch(err) {
    console.log(err);
    next(err);
  }
};

export default exports;