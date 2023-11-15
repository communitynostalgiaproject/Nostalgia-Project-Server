import mongoose, { Schema, Document } from "mongoose";
import { Comment } from "@projectTypes/comment";

const CommentSchema: Schema = new Schema({
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

const CommentModel = mongoose.model<Comment & Document>("Comment", CommentSchema);
export default CommentModel;