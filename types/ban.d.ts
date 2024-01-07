import { ObjectId } from "mongoose";

export interface Ban {
    _id?: ObjectId,
    userId: ObjectId,
    createdDate: Date,
    reason: string,
    active: boolean,
    banCount: number
}