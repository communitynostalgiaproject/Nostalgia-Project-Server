import { Request, Response, NextFunction } from "express";
import { Experience } from "@projectTypes/experience";
import { Document } from "mongoose";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { ValidationError } from "../utils/customErrors";
import { FilesRequest } from "@projectTypes/filesRequest";
import { FileUploader } from "../services/fileUploader.service";
import { FileStorage } from "../services/fileStorage.service";
import ExperienceModel from "../models/experience.model";
import fs from "fs";

export class ExperienceController extends CRUDControllerBase<Experience & Document> {
  private imgUploader: FileUploader;
  private imgStorage: FileStorage;

  constructor(imgUploader: FileUploader, imgStorage: FileStorage) {
    super(ExperienceModel);
    this.imgUploader = imgUploader;
    this.imgStorage = imgStorage
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const extendedReq = req as FilesRequest;
      const experience = JSON.parse(req.body.experience);
      const foodPhoto = extendedReq.files['foodPhoto'][0];
      const personPhoto = extendedReq.files['personPhoto']?.[0];

      if (!experience) throw new ValidationError("Missing experience JSON");
      if (!foodPhoto) throw new ValidationError("Missing food photo");

      const foodPhotoUrl = await this.imgUploader.uploadFile(
        fs.readFileSync(foodPhoto.path),
        `${foodPhoto.filename}.${foodPhoto.mimetype.split("/")[1]}`
      );
      const personPhotoUrl = personPhoto ? await this.imgUploader.uploadFile(
        fs.readFileSync(personPhoto.path),
        `${personPhoto.filename}.${personPhoto.mimetype.split("/")[1]}`
      ) : undefined;

      const newExperience = await this.model.create({
        ...experience,
        foodPhotoUrl,
        personPhotoUrl
      });

      fs.unlink(foodPhoto.path, (err) => {
        if (err) {
          console.error(`Error deleting photo: ${err}`);
        }
      });
      if (personPhoto) fs.unlink(personPhoto.path, (err) => {
        if (err) {
          console.error(`Error deleting photo: ${err}`);
        }
      });

      res.status(201).json(newExperience);
    } catch (err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const extendedReq = req as FilesRequest;
      const experience = JSON.parse(req.body.experience);
      const foodPhoto = extendedReq.files['foodPhoto']?.[0];
      const personPhoto = extendedReq.files['personPhoto']?.[0];
      let newFoodPhotoUrl: string | undefined;
      let newPersonPhotoUrl: string | undefined;

      if (!experience) throw new ValidationError("Missing experience JSON");

      if (foodPhoto) newFoodPhotoUrl = await this.imgUploader.uploadFile(
        fs.readFileSync(foodPhoto.path),
        experience.foodPhotoUrl.split("/").pop()!
      );
      if (personPhoto) newPersonPhotoUrl = await this.imgUploader.uploadFile(
        fs.readFileSync(personPhoto.path),
        experience.personPhotoUrl 
          ? experience.personPhotoUrl.split("/").pop()!
          : `${personPhoto.filename}.${personPhoto.mimetype.split("/")[1]}`
      );

      if (foodPhoto) fs.unlink(foodPhoto.path, (err) => {
        if (err) {
          console.error(`Error deleting photo: ${err}`);
        }
      });
      if (personPhoto) fs.unlink(personPhoto.path, (err) => {
        if (err) {
          console.error(`Error deleting photo: ${err}`);
        }
      });

      const {
        _id,
        __v,
        ...rest
      } = experience;
      await this.model.updateOne({ _id }, {
        ...rest,
        foodPhotoUrl: newFoodPhotoUrl || experience.foodPhotoUrl,
        personPhotoUrl: newPersonPhotoUrl || experience.personPhotoUrl
      });

      res.status(200).send();
    } catch (err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let experience: any;

    try {
      const { documentId } = req.params;
      experience = await this.model.findById(documentId);
      await this.model.deleteOne({ _id: documentId });

      res.status(200).send();
    } catch(err) {
      console.error(err);
      next(this.convertMongoError(err));
    } finally {
      if (experience?.foodPhotoUrl) {
        let splitUrl = experience.foodPhotoUrl.split("/");
        let imageHash = splitUrl[splitUrl.length - 1].split(".")[0];
        await this.imgStorage.deleteFile(await this.imgStorage.getFileId(imageHash));
      }
      if (experience?.personPhotoUrl) {
        let splitUrl = experience.personPhotoUrl.split("/");
        let imageHash = splitUrl[splitUrl.length - 1].split(".")[0];
        await this.imgStorage.deleteFile(await this.imgStorage.getFileId(imageHash));
      }
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
