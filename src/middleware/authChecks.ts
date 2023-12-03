import { Request, Response, NextFunction } from "express";
import ExperienceModel from "../models/experience.model";
import { UnauthorizedUserError, NotLoggedInError, NotFoundError } from "../utils/customErrors";
import { User } from "@projectTypes/user";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  next(new NotLoggedInError("User must be logged in"));
};

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return next(new NotLoggedInError("User must be logged in"));

  console.log(`User: ${JSON.stringify(req.user)}`);
  const { experienceId } = req.params;
  const experience = await ExperienceModel.findById(experienceId);
  const user = req.user as User;

  if (!experience) return next(new NotFoundError("Experience not found"));

  if (experience.creatorId == user._id || user.isModerator || user.isAdmin) return next();

  next(new UnauthorizedUserError("User does not have permission to perform this action"));
};