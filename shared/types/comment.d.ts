import { Document, ObjectId } from "mongoose";

export interface Comment extends Document {
  experienceId: ObjectId;
  text: string;
  createdDate: Date;
  creatorId?: ObjectId;
}