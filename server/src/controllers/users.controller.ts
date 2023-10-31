import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/customErrors";
import { User } from "@shared/types/user";
import utils from "../utils/userUtils";

exports.createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = req.body;
    const savedUser = await utils.createUser(user);

    res.status(200).send(savedUser);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.getUsers = (req: Request, res: Response, next: NextFunction) => {
  res.send("Route in progress")
}

exports.getUserById = (req: Request, res: Response, next: NextFunction) => {
  // To do

  res.send("Route not yet implemented.");
};

exports.updateUser = (req: Request, res: Response, next: NextFunction) => {
  // To do

  res.send("Route not yet implemented.");
};

exports.deleteUser = (req: Request, res: Response, next: NextFunction) => {
  // To do

  res.send("Route not yet implemented.");
};

export default exports;