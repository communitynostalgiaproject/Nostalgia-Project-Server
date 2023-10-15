import { Document } from "mongoose";

declare interface User extends Document {
  googleId: string;
  displayName: string;
}