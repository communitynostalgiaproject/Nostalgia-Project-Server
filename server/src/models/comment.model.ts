import mongoose, { Schema } from "mongoose";
import { Comment } from "@shared/types/comment";

const CommentSchema: Schema = new Schema<Comment>({
  experienceId: {
    type: Schema.Types.ObjectId,
    ref: "Experience",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  creatorId: Schema.Types.ObjectId
});

const CommentModel = mongoose.model<Comment>("Comment", CommentSchema);
export default CommentModel;