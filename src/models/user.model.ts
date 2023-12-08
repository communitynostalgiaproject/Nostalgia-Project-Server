import mongoose, { Schema, Document } from "mongoose";
import { User } from "@projectTypes/user";

const UserSchema = new Schema({
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
  },
  firstLogin: {
    type: Boolean,
    default: true
  }
});

const UserModel = mongoose.model<User & Document>("User", UserSchema);

export default UserModel;