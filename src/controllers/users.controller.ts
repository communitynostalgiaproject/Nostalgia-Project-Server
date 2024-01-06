import { User } from "@projectTypes/user";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { Document } from "mongoose";
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.model";

export class UserController extends CRUDControllerBase<User & Document> {
  constructor(model: any) {
    super(model);
  }

  protected modifyReadQuery = async (query: any): Promise<any> => {
    const {
      createdDate,
      ...rest
    } = query;

    if (createdDate) return { ...rest, joinedDate: createdDate };

    return query;
  };

  fetchUserData = async (req: Request, res: Response, next: NextFunction) => {
    console.log("Fetching user data...");
    console.log(`User data: ${JSON.stringify(req.user)}`);
    try {
      res.status(200).json(req.user);
    } catch(err) {
      this.handleError(err, next);
    }
  }
}

export default new UserController(UserModel);