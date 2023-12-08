import { Document, ObjectId } from "mongoose";

export interface User {
  _id?: ObjectId;
  googleId: string;
  displayName?: string;
  emailAddress: string;
  isModerator: boolean;
  isAdmin: boolean;
  joinedDate: Date;
  firstLogin: boolean;
}