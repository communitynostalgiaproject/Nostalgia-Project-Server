import { Request } from "express";
import { Experience } from "@projectTypes/experience";
import { Document } from "mongoose";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { ValidationError } from "../utils/customErrors";
import ExperienceModel from "../models/experience.model";

export class ExperienceController extends CRUDControllerBase<Experience & Document> {
  constructor(model: any) {
    super(model);
  }

  protected injectReadProjectionString = (req: Request): string => {
    const { locationsOnly } = req.query;

    if (locationsOnly) {
      return "place.location";
    }

    return "";
  };
  
  protected processReadResults = (req: Request, results: any) => {
    const { locationsOnly } = req.query;

    if (locationsOnly) {
      return results.map((result: any) => result.place.location);
    }

    return results;
  };

  protected modifyReadQuery = async (query: any): Promise<any> => {
    const { bbox, locationsOnly, ...rest } = query;

    if (!bbox) return rest;
    const { lowerLeft, upperRight } = this.convertBbox(`${bbox}`);

    return {
      ...rest,
      "place.location": {
        $geoWithin: {
          $box: [lowerLeft, upperRight]
        }
      }
    };
  }

  protected convertBbox = (bbox: string) => {
    const nums = bbox.split(",").map((coord: string) => Number(coord));
    if (nums.length !== 4) {
      throw(new ValidationError("Invalid bbox query parameter"));
    }

    return {
      lowerLeft: [nums[0], nums[1]],
      upperRight: [nums[2], nums[3]]
    };
  }
}

export default new ExperienceController(ExperienceModel);