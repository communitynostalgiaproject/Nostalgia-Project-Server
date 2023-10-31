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

exports.getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {

  } catch(err) {
    console.log(err);
    next(err);
  }
}

exports.getUserById = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Hit!")
  try {
    const { userId } = req.params;
    const user = await utils.getUserById(userId);

    res.status(200).send(user);
  } catch(err) {
    console.log(err);
    next(err);
  }
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