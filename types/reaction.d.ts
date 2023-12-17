import { ObjectId } from "mongoose";

export type ReactionType = "meToo" | "thanksForSharing" | "willTry";

export interface Reaction {
  reaction: ReactionType;
  userId: ObjectId;
  experienceId: ObjectId;
  createdDate: Date;
}