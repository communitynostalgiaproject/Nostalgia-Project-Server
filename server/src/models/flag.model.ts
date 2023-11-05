import mongoose, { Schema, Document } from "mongoose";
import { Flag } from "@shared/types/flag";

const FlagSchema = new Schema({
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "contentType"
  },
  contentType: {
    type: String,
    required: true,
    enum: ["Experience", "Comment"]
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  priority: String,
  reason: String,
  userComment: String,
  moderatorComments: [String],
  resolved: {
    type: Boolean,
    default: false
  },
  contentDeleted: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

const FlagModel = mongoose.model<Flag & Document>("Flag", FlagSchema);

export default FlagModel;