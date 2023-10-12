import { GeoJSONPoint, PeliasGeoJSONProperties } from "@stadiamaps/api";

declare interface Place {
  address: PeliasGeoJSONProperties,
  location: GeoJSONPoint
}