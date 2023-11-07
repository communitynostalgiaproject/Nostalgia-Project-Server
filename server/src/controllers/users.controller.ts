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
    const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 0;
    const users = await utils.getUsers(limit)

    res.status(200).send(users);

  } catch(err) {
      console.log(err);
      next(err);
  }
}

exports.getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await utils.getUserById(userId);

    res.status(200).send(user);
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: User = req.body;
    await utils.updateUser(user);

    res.status(200).send();
  } catch(err) {
    console.log(err);
    next(err);
  }
};

exports.deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    console.log(`User ID: ${userId}`);
    await utils.deleteUser(userId);

    res.status(200).send();
  } catch(err) {
    console.log(err);
    next(err);
  }
};

export default exports;