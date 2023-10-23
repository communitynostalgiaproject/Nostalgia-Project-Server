import { Document } from "mongoose";

export interface User extends Document {
  googleId: string;
  displayName?: string;
  emailAddress: string;
  isModerator: boolean;
  isAdmin: boolean;
  joinedDate: Date;
}