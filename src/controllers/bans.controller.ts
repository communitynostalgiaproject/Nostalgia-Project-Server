import { Ban } from "@projectTypes/ban";
import { Document } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { MAX_BANS } from "../config/constants";
import { NotFoundError } from "../utils/customErrors";
import BanModel from "../models/ban.model";

export class BanController extends CRUDControllerBase<Ban & Document> {
  constructor() {
    super(BanModel);
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const existingBan = await BanModel.findOne({ userId });

      if (!existingBan) {
        const newBan = new this.model({
          userId,
          reason
        });
        
        await newBan.save();
        res.status(200).json(newBan);
      } else if (!existingBan.active) {
        existingBan.active = true;
        existingBan.reason = reason;
        existingBan.banCount += 1;
        await existingBan.save();
        res.status(200).json(existingBan);
      } else {
        res.status(409).json({ message: "User is already banned" });
      }
    } catch(err) {
      this.handleError(err, next);
    }
  };

  findBan = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const doc = await this.model.findOne({ userId });

      if (!doc) return next(new NotFoundError("No existing ban"));

      res.status(200).json(doc);
    } catch(err) {
      this.handleError(err, next);
    }
  };

  reinstate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const existingBan = await BanModel.findOne({ userId });

      if (!existingBan || !existingBan.active) 
        return res.status(409).json({ message: "User is not banned" });

      if (existingBan.banCount === MAX_BANS)
        return res.status(409).json({ message: "User has reached the maximum number of bans" });

      existingBan.active = false;
      await existingBan.save();
      res.status(200).json(existingBan);
    } catch(err) {
      this.handleError(err, next);
    }
  };


};
