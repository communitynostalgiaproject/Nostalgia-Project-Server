import mongoose from "mongoose";
import { PeliasGeoJSONProperties } from "@stadiamaps/api";

declare interface Place {
  address: PeliasGeoJSONProperties,
  location: mongoose.Schema.Types.GeoJSON
}