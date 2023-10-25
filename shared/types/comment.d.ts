import { ObjectId } from "mongoose";

export interface Comment {
  _id?: ObjectId;
  experienceId: ObjectId;
  text: string;
  createdDate: Date;
  creatorId?: ObjectId;
}