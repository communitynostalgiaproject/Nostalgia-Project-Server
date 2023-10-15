import mongoose, { Schema } from "mongoose";
import { User } from "types/user";

const UserSchema = new Schema<User>({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  }
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;