import mongoose, { Schema } from "mongoose";
import { User } from "types/user";

const UserSchema = new Schema<User>({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  moderator: {
    type: Boolean,
    default: false
  },
  joinedDate: {
    type: Date,
    default: Date.now
  }
});

const UserModel = mongoose.model<User>("User", UserSchema);

export default UserModel;