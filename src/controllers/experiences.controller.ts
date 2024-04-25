import { Request, Response, NextFunction } from "express";
import { Experience } from "@projectTypes/experience";
import { Document } from "mongoose";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { NoFileFoundError, ValidationError } from "../utils/customErrors";
import { FileUploader } from "../services/fileUploader.service";
import { FileStorage } from "../services/fileStorage";
import ExperienceModel from "../models/experience.model";
import fs from "fs";

export class ExperienceController extends CRUDControllerBase<Experience & Document> {
  private imgUploader: FileUploader;
  private imgStorage: FileStorage;

  constructor(imgUploader: FileUploader, imgStorage: FileStorage) {
    super(ExperienceModel);
    this.imgUploader = imgUploader;
    this.imgStorage = imgStorage;
  };

  uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imageFile = req.file;
      if (!imageFile) throw new NoFileFoundError("Expected an image file");
      const imageUrl = await this.imgUploader.uploadFile(
        fs.readFileSync(imageFile.path),
        `${imageFile.filename}.${imageFile.mimetype.split("/")[1]}`
      );

      res.status(201).json({
        imageUrl
      });
    } catch(err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  }

  updatePhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imageFile = req.file;
      if (!imageFile) throw new NoFileFoundError("Expected an image file");
      const prevImgUrl = req.body?.["imageUrl"];
      await this.imgStorage.deleteFile(await this.imgStorage.getFileId(prevImgUrl));
      const imageUrl = await this.imgUploader.uploadFile(
        fs.readFileSync(imageFile.path),
        `${imageFile.filename}.${imageFile.mimetype.split("/")[1]}`
      );
      res.status(200).json({
        imageUrl
      });
    } catch (err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  }

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let experience: any;

    try {
      const { documentId } = req.params;
      experience = await this.model.findById(documentId);
      await this.model.deleteOne({ _id: documentId });

      res.status(204).send();
    } catch(err) {
      console.error(err);
      next(this.convertMongoError(err));
    } finally {
      if (experience?.foodPhotoUrl) await this.imgStorage
        .deleteFile(await this.imgStorage.getFileId(experience.foodPhotoUrl));
      if (experience?.personPhotoUrl) await this.imgStorage
        .deleteFile(await this.imgStorage.getFileId(experience.personPhotoUrl));
    }
  };

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

  protected modifyReadQuery = async (req: Request, query: any): Promise<any> => {
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
  };

  protected convertBbox = (bbox: string) => {
    const nums = bbox.split(",").map((coord: string) => Number(coord));
    if (nums.length !== 4) {
      throw(new ValidationError("Invalid bbox query parameter"));
    }

    return {
      lowerLeft: [nums[0], nums[1]],
      upperRight: [nums[2], nums[3]]
    };
  };
};
