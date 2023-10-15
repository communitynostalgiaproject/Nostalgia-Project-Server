import mongoose, { Schema } from "mongoose";
import { Comment } from "types/comment";

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
  }
});

const CommentModel = mongoose.model<Comment>("Comment");
export default CommentModel;