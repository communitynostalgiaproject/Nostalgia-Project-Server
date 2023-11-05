import mongoose, { ObjectId } from "mongoose";
import FlagModel from "../models/flag.model";
import { ValidationError, NotFoundError } from "./customErrors";
import { DEFAULT_LIMIT } from "../config/constants";

export const createFlag = async (newFlag: any) => {
  const flag = new FlagModel(newFlag);

  try {
    const savedFlag = await flag.save();

    return savedFlag;
  } catch(err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw(new ValidationError(`Invalid flag: ${err}`));
    }
  }
};

export const getFlagById = async (flagId: string) => {
  try {
    const flag = await FlagModel.findById(flagId);

    if (!flag) throw(new NotFoundError("Experience not found")); 
  
    return flag;
  } catch(err) {
    if (err instanceof mongoose.Error.DocumentNotFoundError) {
      throw(new NotFoundError("Experience not found"));
    }

    throw(err);
  }
};

interface GetFlagsOptions {
  limit?: number;
  offset?: number;
  contentId?: string;
  userId?: string;
  createdBefore?: string;
  createdAfter?: string;
  priority?: string;
  reason?: string;
  resolved?: string;
  resolvedBy?: string;
}

export const getFlags = async (options: GetFlagsOptions = {}) => {
  const {
    limit,
    offset,
    createdBefore,
    createdAfter,
    resolved,
    ...rest
  } = options;
  const query: any = {...rest};

  if (createdBefore) query.createdDate = { $lt: new Date(createdBefore) };
  if (createdAfter) query.createdDate = { ...query.createdDate, $gt: new Date(createdAfter) };
  if (resolved) query.resolved = resolved === "true";

  const experiences = await FlagModel
    .find(query)
    .skip((!offset || Number(offset) < 1 || isNaN(Number(offset))) ? 0 : Number(offset))
    .limit((!limit || Number(limit) < 1 || isNaN(Number(limit))) ? DEFAULT_LIMIT : Number(limit));

  return experiences;
};

export const updateFlag = async (flag: any) => {
  await FlagModel.updateOne(flag);
};

export const deleteFlag = async (flagId: string) => {
  const deleteResult = await FlagModel.deleteOne({ _id: flagId });
  
  if (deleteResult.deletedCount === 0) throw(new Error("Unable to delete flag"));
};

export default {
  createFlag,
  getFlagById,
  getFlags,
  updateFlag,
  deleteFlag
};