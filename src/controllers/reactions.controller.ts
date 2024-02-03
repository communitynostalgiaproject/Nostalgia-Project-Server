import { CRUDControllerBase } from "./base/CRUDControllerBase";
import { Document } from "mongoose";
import { Reaction } from "@projectTypes/reaction";
import ReactionModel from "../models/reaction.model";

export class ReactionController extends CRUDControllerBase<Reaction & Document> {
  constructor() {
    super(ReactionModel);
  };
};