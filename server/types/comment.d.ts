import { Document, ObjectId } from "mongoose";

declare interface Comment extends Document {
  experienceId: ObjectId;
  text: string;
  createdDate: Date;
  creatorId?: ObjectId;
}