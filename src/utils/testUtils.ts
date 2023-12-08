import request from "supertest";
import UserModel from "../models/user.model";
import { Express } from "express";

const getSessionCookie = (httpResponse: any) => {
  return httpResponse
  .headers["set-cookie"][0]
  .split(";")[0]
  .trim();
};

export const performLogin = async (app: Express, options?: any) => {
  const {
    isModerator,
    isAdmin,
    userId
  } = options;
  const query = userId ? `?userId=${userId}` : isModerator ? `?isModerator=${isModerator}` : isAdmin ? `?isAdmin=${isAdmin}` : "";
  const authRes = await request(app).get(`/auth/mock${query}`);
  const sessionCookie = getSessionCookie(authRes);
  const testUser = authRes.body.user;

  return {
    sessionCookie,
    testUser
  };
}

export const performLogout = async (app: Express, testUser: any) => {
  try {
    await request(app).get("/auth/logout");
    await UserModel.deleteOne({_id: testUser._id});
  } catch(err) {
    console.log(`Unable to perform logout functions: ${err}`);
  }
}