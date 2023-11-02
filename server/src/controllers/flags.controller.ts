import { Request, Response, NextFunction } from "express";
import { Flag } from "@shared/types/flag";
import utils from "../utils/flagUtils";

// Create
exports.createFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newFlag: Flag = req.body;
    const savedFlag = await utils.createFlag(newFlag);

    res.status(200).send(savedFlag);
  } catch(err) {
    console.error(err);
    next(err);
  }
};

// Read
exports.getFlagById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flagId } = req.params;
    const flag = await utils.getFlagById(flagId);

    res.status(200).send(flag);
  } catch(err) {
    console.error(err);
    next(err);
  }
};

exports.getFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await utils.getFlags(req.query);

    res.status(200).send(flags);
  } catch(err) {
    console.error(err);
    next(err);
  }
};

// Update
exports.updateFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag: Flag = req.body;
    await utils.updateFlag(flag);

    res.status(200).send();
  } catch(err) {
    console.error(err);
    next(err);
  }
};

// Delete
exports.deleteFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flagId } = req.params;
    await utils.deleteFlag(flagId);

    res.status(200).send();
  } catch(err) {
    console.error(err);
    next(err);
  }
};

export default exports;