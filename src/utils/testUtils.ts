import request from "supertest";
import UserModel from "../models/user.model";
import BanModel from "../models/ban.model";
import { Express } from "express";

const getSessionCookie = (httpResponse: any) => {
  return httpResponse
  .headers["set-cookie"][0]
  .split(";")[0]
  .trim();
};

interface PerformLoginOptions {
  googleId?: string;
};

export const performLogin = async (app: Express, options: PerformLoginOptions = {}) => {
  const {
    googleId
  } = options;
  const query = googleId ? `?googleId=${googleId}` : "";
  const authRes = await request(app).get(`/auth/mock${query}`);
  const sessionCookie = getSessionCookie(authRes);
  const testUser = authRes.body.user;

  return {
    sessionCookie,
    testUser
  };
};

export const performLogout = async (app: Express, deleteUserId?: string) => {
  try {
    await request(app).get("/auth/logout");
    if (deleteUserId) await UserModel.deleteOne({_id: deleteUserId});
  } catch(err) {
    console.log(`Unable to perform logout functions: ${err}`);
  }
};

interface UpgradePermissionsOptions {
  testUser: any;
  makeModerator?: boolean;
  makeAdmin?: boolean;
};

export const upgradePermissions = async (app: Express, options: UpgradePermissionsOptions) => {
  const {
    testUser,
    makeModerator,
    makeAdmin
  } = options;

  try {
    await UserModel.updateOne({_id: testUser._id}, {
      isModerator: makeModerator ? true : false,
      isAdmin: makeAdmin ? true : false
    });
  } catch(err) {
    console.log(`Unable to make user moderator: ${err}`);
  }
};

export const banUser = async (options: any) => {
  const {
    userId
  } = options;

  try {
    await BanModel.create({
      userId,
      reason: "Test ban"
    });
  } catch(err) {
    console.log(`Unable to ban user: ${err}`);
  }
};