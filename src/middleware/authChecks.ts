import { Request, Response, NextFunction } from "express";
import ExperienceModel from "../models/experience.model";
import { UnauthorizedUserError, NotLoggedInError, NotFoundError } from "../utils/customErrors";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  next(new NotLoggedInError("User must be logged in"));
};

const experienceAuthCheck = async (user: any, experienceId: String) => {
  const experience = await ExperienceModel.findById(experienceId);
  if (!experience) return new NotFoundError("Experience not found");

  if (!(experience.creatorId.toString() === user._id.toString() || user.isModerator || user.isAdmin)) return new UnauthorizedUserError("User does not have permission to perform this action");
}

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) return next(new NotLoggedInError("User must be logged in"));

    const { experienceId, flagId } = req.params;

    if (experienceId) return next(await experienceAuthCheck(req.user, experienceId));

    next(new Error("Internal server error"));
  } catch(err) {
    next(err);
  }
};