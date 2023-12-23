import { Request, Response, NextFunction } from "express";
import { UnauthorizedUserError, NotLoggedInError, NotFoundError, ValidationError } from "../utils/customErrors";
import { ObjectId } from "mongodb";
import { User } from "../../types/user";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  next(new NotLoggedInError("User must be logged in"));
};

const generalAuthCheck = async (user: any, model: any, documentId: string, checkPermission: (user: any, document: any) => boolean) => {
  if (!ObjectId.isValid(`${documentId}`)) {
    throw new ValidationError("Invalid object id");
  }

  const document = await model.findById(documentId);
  if (!document) {
    throw new NotFoundError("Document not found");
  }

  if (!checkPermission(user, document)) {
    throw new UnauthorizedUserError("User does not have permission to perform this action");
  }
};

export const createAuthorizationMiddleware = (model: any, checkPermission: (user: any, document: any) => boolean) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        throw new NotLoggedInError("User must be logged in");
      }

      const documentId = req.params.documentId;
      await generalAuthCheck(req.user, model, documentId, checkPermission);
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const isModerator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return next(new NotLoggedInError("User must be logged in"));
  }

  const { isModerator, isAdmin } = req.user as User;
  if (isModerator || isAdmin) {
    return next();
  }
  next(new UnauthorizedUserError("User is not a moderator"));
};