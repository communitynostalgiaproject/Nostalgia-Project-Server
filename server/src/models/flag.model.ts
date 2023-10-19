import mongoose, { Schema } from "mongoose";
import { Flag } from "types/flag";

const FlagSchema = new Schema<Flag>({
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "contentType"
  },
  contentType: {
    type: String,
    required: true,
    enum: ['Experience', 'Comment']  // These values should match the model names.
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'  // Assuming you have a User model.
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
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

const FlagModel = mongoose.model<Flag>("Flag", FlagSchema);

export default FlagModel;