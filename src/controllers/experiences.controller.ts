import e, { Request, Response, NextFunction } from "express";
import { Experience } from "@projectTypes/experience";
import { Document } from "mongoose";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { ValidationError } from "../utils/customErrors";
import { FilesRequest } from "@projectTypes/filesRequest";
import { ImageUploadRequest } from "../services/fileUploadRequest.service";
import { MockImageScaler, SharpImageScaler } from "../services/imageScaler.service";
import { MockVirusScanner, VirusTotalScanner } from "../services/virusScanner.service";
import { MockFileStorage, S3StorageService } from "../services/fileStorage.service";
import { IMAGE_MAX_WIDTH } from "../config/constants";
import ExperienceModel from "../models/experience.model";
import BanModel from "../models/ban.model";
import fs from "fs";

export class ExperienceController extends CRUDControllerBase<Experience & Document> {
  constructor(model: any) {
    super(model);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const extendedReq = req as FilesRequest;
      const experience = JSON.parse(req.body.experience);
      const foodPhoto = extendedReq.files['foodPhoto'][0];
      const personPhoto = extendedReq.files['personPhoto'][0];
      const userBanned = await this.checkBanStatus(experience.creatorId);

      if (userBanned) {
        res.status(403).json({ message: "User is banned" });
        return;
      }

      const uploadRequest = this.createUploadRequest();

      if (!experience) throw new ValidationError("Missing experience JSON");
      if (!foodPhoto) throw new ValidationError("Missing food photo");

      const foodPhotoUrl = await uploadRequest.uploadFile(
        fs.readFileSync(foodPhoto.path),
        `${foodPhoto.filename}.${foodPhoto.mimetype.split("/")[1]}`
      );
      const personPhotoUrl = personPhoto ? await uploadRequest.uploadFile(
        fs.readFileSync(personPhoto.path),
        `${personPhoto.filename}.${personPhoto.mimetype.split("/")[1]}`
      ) : undefined;

      const newExperience = await this.model.create({
        ...experience,
        foodPhotoUrl,
        personPhotoUrl
      });

      fs.unlinkSync(foodPhoto.path);
      if (personPhoto) fs.unlinkSync(personPhoto.path);

      res.status(201).json(newExperience);
    } catch (err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  }

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const extendedReq = req as FilesRequest;
      const experience = JSON.parse(req.body.experience);
      const foodPhoto = extendedReq.files['foodPhoto'][0];
      const personPhoto = extendedReq.files['personPhoto'][0];
      let newFoodPhotoUrl: string | undefined;
      let newPersonPhotoUrl: string | undefined;

      const uploadRequest = this.createUploadRequest();

      if (!experience) throw new ValidationError("Missing experience JSON");

      if (foodPhoto) newFoodPhotoUrl = await uploadRequest.uploadFile(
        fs.readFileSync(foodPhoto.path),
        experience.foodPhotoUrl.split("/").pop()!
      );
      if (personPhoto) newPersonPhotoUrl = await uploadRequest.uploadFile(
        fs.readFileSync(personPhoto.path),
        experience.personPhotoUrl 
          ? experience.personPhotoUrl.split("/").pop()!
          : `${personPhoto.filename}.${personPhoto.mimetype.split("/")[1]}`
      );

      if (foodPhoto) fs.unlinkSync(foodPhoto.path);
      if (personPhoto) fs.unlinkSync(personPhoto.path);

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
  }

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documentId } = req.params;
      const experience = await this.model.findById(documentId);
      const storageService = this.createStorageService();

      if (!experience) throw new ValidationError("Experience not found");

      if (experience.foodPhotoUrl) await storageService.deleteFile(experience.foodPhotoUrl.split("/").pop()!);
      if (experience.personPhotoUrl) await storageService.deleteFile(experience.personPhotoUrl.split("/").pop()!);

      const deleteResult = await this.model.deleteOne({ _id: documentId });

      if (deleteResult.deletedCount === 0) throw(new Error("Unable to delete document"));

      res.status(200).send();
    } catch(err) {
      console.error(err);
      next(this.convertMongoError(err));
    }
  }

  private createUploadRequest = () => {
    const storageService = this.createStorageService();
    const virusScanner = this.createVirusScanner();
    const imageScaler = this.createImageScaler();

    return new ImageUploadRequest(
      virusScanner,
      imageScaler,
      storageService,
      IMAGE_MAX_WIDTH
    );
  }

  private createStorageService = () => {
    if (
      process.env.NODE_ENV === "test"
      || process.env.BYPASS_FILE_STORAGE
    ) return new MockFileStorage();

    return  new S3StorageService(process.env.AWS_S3_BUCKET_NAME!, process.env.AWS_REGION!);
  };



  private createVirusScanner = () => {
    if (
      process.env.NODE_ENV === "test" 
      || !process.env.VIRUS_TOTAL_API_KEY 
      || process.env.BYPASS_VIRUS_SCANNING
    ) return new MockVirusScanner();

    return new VirusTotalScanner(process.env.VIRUS_TOTAL_API_KEY!);
  };

  private createImageScaler = () => {
    if (
      process.env.NODE_ENV === "test"
      || process.env.BYPASS_IMAGE_SCALING
    ) return new MockImageScaler();

    return new SharpImageScaler();
  }

  private checkBanStatus = async (userId: string): Promise<boolean> => {
    const ban = await BanModel.findOne({ userId });

    if (ban && ban.active) return true;

    return false;
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