import { ObjectId } from "mongoose";
import { GeoJSONPoint, PeliasGeoJSONProperties } from "@stadiamaps/api";

export interface Place {
  address: PeliasGeoJSONProperties,
  location: GeoJSONPoint
}

export interface Experience {
  _id?: ObjectId;
  title: string;
  place: Place;
  description: string;
  recipe?: string;
  experienceDate: string;
  createdDate?: string;
  mood?: string;
  foodtype?: string;
  personItRemindsThemOf?: string;
  flavourProfile?: string;
  periodOfLifeAssociation?: string;
  placesToGetFood?: Place[];
  creatorId?: ObjectId;
}