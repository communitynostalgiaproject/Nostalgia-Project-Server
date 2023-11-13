import mongoose, { ObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { ValidationError, NotFoundError } from "./customErrors";
import { DEFAULT_LIMIT } from "../config/constants";

exports.createUser = async (newUser: any) => {
    const user = new UserModel(newUser);

    try {
        const savedUser = await user.save();

        return savedUser;

    } catch(err) {
        if (err instanceof mongoose.Error.ValidationError) {
            throw(new ValidationError(`Invalid User: ${err}`));
        }
    }
};

exports.getUsers = async (limit: number = DEFAULT_LIMIT) => {
        const users = await UserModel.find({}).limit(limit);
    
        return users;
}

exports.getUserById = async (userId: string) => {
    try {
        const user = await UserModel.findById(userId);
        
        if (!user) throw(new NotFoundError("User not found")); 
      
        return user;

      } catch(err) {
        if (err instanceof mongoose.Error.DocumentNotFoundError) {
            throw(new NotFoundError("User not found"));
        }

        throw(err);
      }
};

exports.updateUser = async (user: any) => {
    await UserModel.updateOne(user);
};

exports.deleteUser = async (userId: ObjectId) => {
    await UserModel.deleteOne({ _id: userId });
};

export default exports;