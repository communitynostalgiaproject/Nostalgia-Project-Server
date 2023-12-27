import { Ban } from "@projectTypes/ban";
import { Document } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { MAX_BANS } from "../config/constants";
import BanModel from "../models/ban.model";

export class BanController extends CRUDControllerBase<Ban & Document> {
  constructor(model: any) {
    super(model);
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
        res.status(201).json(newBan);
      } else if (!existingBan.active) {
        existingBan.active = true;
        existingBan.reason = reason;
        existingBan.banCount += 1;
        await existingBan.save();
        res.status(201).json(existingBan);
      } else {
        res.status(409).json({ message: "User is already banned" });
      }
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

export default new BanController(BanModel);