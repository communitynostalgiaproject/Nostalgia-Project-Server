import { Profile, VerifyCallback } from 'passport-google-oauth20';
import UserModel from '../models/user.model';

  /**
   * Google OAuth Strategy Overview
   * 
   * 1. Check DB for a user document with the same googleId
   * 2. If found, log the user in.
   * 3. If not found, create a new user record for the user and log them in.
   */
export const authCallback = async (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {
  try {
    const userDoc = await UserModel.findOne({googleId: profile.id});

    if (userDoc) {
      if (userDoc.firstLogin) {
        userDoc.firstLogin = false;
        await userDoc.save();
      }
      return done(undefined, userDoc);
    }
    else {
      const newUser = new UserModel({
        googleId: profile.id,
        emailAddress: profile.emails?.[0].value,
        displayName: profile.displayName
      });
      await newUser.save();
      done(undefined, newUser);
    }
  } catch(err) {
    console.error(err);
    done(JSON.stringify(err), undefined);
  }
};