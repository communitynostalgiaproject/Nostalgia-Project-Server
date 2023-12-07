import { Request, Response, NextFunction } from "express";
import ExperienceModel from "../models/experience.model";
import { UnauthorizedUserError, NotLoggedInError, NotFoundError, ValidationError } from "../utils/customErrors";
import { ObjectId } from "mongodb";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  next(new NotLoggedInError("User must be logged in"));
};

const experienceAuthCheck = async (user: any, experienceId: String) => {
  if (!ObjectId.isValid(`${experienceId}`)) return new ValidationError("Invalid object id");
  const experience = await ExperienceModel.findById(experienceId);

  if (!experience) return new NotFoundError("Experience not found");

  if (!(experience.creatorId.toString() === user._id.toString() || user.isModerator || user.isAdmin)) return new UnauthorizedUserError("User does not have permission to perform this action");
}

const flagAuthCheck = (user: any) => {
  if (!(user.isAdmin || user.isModerator)) return (new UnauthorizedUserError("User does not have permission to perform this action"));
}

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) return next(new NotLoggedInError("User must be logged in"));

    const { experienceId, flagId } = req.params;

    if (experienceId) return next(await experienceAuthCheck(req.user, experienceId));
    if (flagId) return next(flagAuthCheck(req.user));

    next(new Error("Something went wrong..."));
  } catch(err) {
    next(err);
  }
};