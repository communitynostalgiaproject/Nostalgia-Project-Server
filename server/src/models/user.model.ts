import mongoose, { Schema } from "mongoose";
import { User } from "@shared/types/user";

const UserSchema = new Schema<User>({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (email: any) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: (props) => `${props.value} is not a valid email address`
    }
  },
  isModerator: {
    type: Boolean,
    default: false
  },
  isAdmin: {
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