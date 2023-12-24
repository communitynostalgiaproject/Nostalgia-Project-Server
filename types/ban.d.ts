import { ObjectId } from "mongoose";

export interface Ban {
    userId: ObjectId,
    createdDate: Date,
    reason: string,
}