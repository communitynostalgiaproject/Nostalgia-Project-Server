import mongoose, { Schema, Document } from "mongoose";
import { Reaction } from "@projectTypes/reaction";

const ReactionSchema = new Schema({
  reaction: {
    type: String,
    required: true,
    enum: ["meToo", "thanksForSharing", "willTry"]
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  experienceId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Experience"
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const ReactionModel = mongoose.model<Reaction & Document>("Reaction", ReactionSchema);
export default ReactionModel;