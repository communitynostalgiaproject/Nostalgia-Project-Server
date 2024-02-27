import { User } from "@projectTypes/user";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { Document } from "mongoose";
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";
import ExperienceModel from "../models/experience.model";

export class UserController extends CRUDControllerBase<User & Document> {
  constructor() {
    super(UserModel);
  }

  protected modifyReadQuery = async (req: Request, query: any): Promise<any> => {
    const {
      createdDate,
      ...rest
    } = query;

    if (createdDate) return { ...rest, joinedDate: createdDate };

    return query;
  };
  
  protected processReadResults = (req: Request, results: (User & Document)[]) => {
    const loggedInUser = req.user ? req.user as User : undefined;
    const isModerator = loggedInUser && (loggedInUser.isModerator || loggedInUser.isAdmin);
    const processedResults: any[] = [];

    results.forEach((user: any) => {
      const isLoggedInAsUser = loggedInUser && `${loggedInUser._id}` === `${user._id}`;

      if (isLoggedInAsUser || isModerator) {
        processedResults.push(user);
      } else {
        processedResults.push(this.removeSensitiveData(user));
      }
    });

    return processedResults;
  };

  private removeSensitiveData = (userDocument: User & Document) => {
    const { _id, displayName } = userDocument;

    return { _id, displayName };
  };

  protected processUpdateObject = (req: Request, updateObject: any) => {
    const { displayName } = updateObject;

    return { displayName };
  };

  protected afterDelete = async (req: Request, documentId: string) => {
    const { deletePosts } = req.query;

    if (deletePosts && deletePosts === "true") await ExperienceModel.deleteMany({creatorId: documentId});
  };

  fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(req.user);
    } catch(err) {
      this.handleError(err, next);
    }
  };
};