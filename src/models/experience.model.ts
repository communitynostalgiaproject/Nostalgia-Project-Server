import mongoose, { Schema, Document } from "mongoose";
import { GeoJSONPoint } from "@stadiamaps/api";
import { Experience, Place } from "@projectTypes/experience";

const isValidDate = (value: string): boolean => {
  const date = new Date(value);

  return !isNaN(date.getTime());
};

const GeoJSONPointSchema = new Schema<GeoJSONPoint>({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const PlaceSchema = new Schema<Place>({
  address: {
    type: Schema.Types.Mixed,
    required: true
  },
  location: {
    type: GeoJSONPointSchema,
    required: true
  }
});
 
const ExperienceSchema: Schema = new Schema({
  title: { type: String, required: true },
  place: {
    type: PlaceSchema,
    required: true
  },
  description: { type: String, required: true },
  recipe: String,
  experienceDate: {
    type: String,
    required: true,
    validate: {
      validator: isValidDate,
      message: (props: any) => `${props.value} is not a valid date string`
    }
  },
  createdDate: { type: String, default: new Date().toISOString() },
  mood: String,
  foodtype: String,
  personItRemindsThemOf: String,
  flavourProfile: String,
  periodOfLifeAssociation: String,
  placesToGetFood: [PlaceSchema],
  creatorId: String
});

const ExperienceModel = mongoose.model<Experience & Document>("Experience", ExperienceSchema);
export default ExperienceModel;