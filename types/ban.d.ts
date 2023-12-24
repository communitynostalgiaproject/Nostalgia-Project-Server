import { ObjectId } from "mongoose";

export type BanStatus = "active" | "restored"

export interface Ban {
    userId: ObjectId,
    createdDate: Date,
    reason: string,
    status: BanStatus,
    banCount: number
}