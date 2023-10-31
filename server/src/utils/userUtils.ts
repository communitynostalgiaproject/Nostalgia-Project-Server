import { ObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { ValidationError } from "./customErrors";

exports.createUser = async (newUser: any) => {
  const user = new UserModel(newUser);
  const savedUser = await user.save();

  return savedUser;
};

exports.getUsers = async (limit: number) => {
    
}

exports.getUserById = async (userId: string) => {
  const user = await UserModel.findById(userId);

  return user;
};

exports.updateUser = async (user: any) => {
  await UserModel.updateOne(user);
};

exports.deleteUser = async (userId: ObjectId) => {
  await UserModel.deleteOne({ _id: userId });
};

export default exports;