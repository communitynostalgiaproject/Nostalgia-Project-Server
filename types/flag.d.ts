import { ObjectId } from "mongoose";

export type ContentType = "Experience" | "Comment";
export type FlagPriority = "low" | "medium" | "high";
export type FlagReason = "spam" | "hate-speech" | "misinformation" | "other";

export interface Flag {
  _id?: ObjectId;
  contentId: ObjectId;
  contentType: ContentType;
  userId: ObjectId;
  createdDate: Date;
  priority: FlagPriority;
  reason: FlagReason;
  userComment: string;
  moderatorComments: [string];
  resolved: boolean;
  contentDeleted?: boolean;
  resolvedBy?: ObjectId;
}