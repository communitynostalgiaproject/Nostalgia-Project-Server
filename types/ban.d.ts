import { ObjectId } from "mongoose";

export type BanStatus = "active" | "restored"

export interface Ban {
    _id?: ObjectId,
    userId: ObjectId,
    createdDate: Date,
    reason: string,
    status: BanStatus,
    banCount: number
}