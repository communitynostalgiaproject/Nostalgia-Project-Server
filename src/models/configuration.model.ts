import mongoose, { Schema, Document } from "mongoose";
import { Configuration } from "@projectTypes/configuration";

const ConfigurationSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: String
}, { timestamps: true });

const ConfigurationModel = mongoose.model<Configuration>("Configuration", ConfigurationSchema);
export default ConfigurationModel;