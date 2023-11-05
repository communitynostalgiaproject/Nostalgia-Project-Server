import mongoose, { ObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { ValidationError, NotFoundError } from "./customErrors";

exports.createUser = async (newUser: any) => {
    const user = new UserModel(newUser);

    try {
        const savedUser = await user.save();

        return savedUser;

    } catch(err) {
        if (err instanceof mongoose.Error.ValidationError) {
            throw(new ValidationError(`Invalid experience: ${err}`));
        }
    }
};

exports.getUsers = async (limit: number = 0) => {
    const users = await UserModel.find({}).limit(limit)

    return users
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