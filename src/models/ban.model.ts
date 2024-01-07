import mongoose, { Schema, Document } from "mongoose";
import { Ban } from "@projectTypes/ban";

const BanSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  banCount: {
    type: Number,
    default: 1
  }
});

const BanModel = mongoose.model<Ban & Document>("Ban", BanSchema);
export default BanModel;