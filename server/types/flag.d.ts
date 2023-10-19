import { Document, ObjectId } from "mongoose";

type ContentType = "Experience" | "Comment";
type FlagPriority = "low" | "medium" | "high";
type FlagReason = "spam" | "hate-speech" | "misinformation" | "other";

declare interface Flag extends Document {
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