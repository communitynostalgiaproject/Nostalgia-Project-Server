import { User } from "@projectTypes/user";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { Document } from "mongoose";
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
}

export default new UserController(UserModel);