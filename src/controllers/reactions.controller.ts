import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { Request, Response, NextFunction } from "express";
import { Document } from "mongoose";
import { Reaction } from "@projectTypes/reaction";
import ReactionModel from "../models/reaction.model";
import { User } from "@projectTypes/user";

export class ReactionController extends CRUDControllerBase<Reaction & Document> {
  constructor() {
    super(ReactionModel);
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reactionDoc = this.getDoc(req);

      const existingReaction = await this.model.findOne(reactionDoc);

      if (existingReaction) {
        res.status(200).send();
        return;
      }

      await this.model.create(reactionDoc);
      res.status(201).send();
    } catch (err) {
      this.handleError(err, next);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reactionDoc = this.getDoc(req);
  
      await this.model.deleteOne(reactionDoc);
      res.status(200).send();
    } catch (err) {
      this.handleError(err, next);
    }
  };

  byUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { _id: userId } = req.user as User;
      const { experienceId } = req.params;
  
      const results = await this.model.find({ userId, experienceId });
      res.status(200).send(results);
    } catch (err) {
      this.handleError(err, next);
    }
  };

  protected async modifyReadQuery(req: Request, query: any) {
    const { experienceId } = req.params;

    return {
      ...query,
      experienceId
    };
  };

  private getDoc = (req: Request) => {
    const { _id: userId } = req.user as User;
    const { experienceId } = req.params;
    const { reaction } = req.body;

    return {
      userId,
      experienceId,
      reaction
    };
  };
};