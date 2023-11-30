import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import UserModel from '../models/user.model';
import { User } from '@projectTypes/user';
import { Request, Response, NextFunction } from "express";

// Define user (de-)serialization methods
passport.serializeUser<any, any>((req, user, done) => {
  done(undefined, user);
});

passport.deserializeUser(async (id, done) => {
  UserModel.findById(id, (err: any, user: User) => done(err, user));
});

/**
 * Google OAuth Strategy Overview
 * 
 * 1. Check DB for a user document with the same googleId
 * 2. If found, log the user in.
 * 3. If not found, create a new user record for the user and log them in.
 */
passport.use(new GoogleStrategy({
  clientID: `${process.env.GOOGLE_AUTH_CLIENT_ID}`,
  clientSecret: `${process.env.GOOGLE_AUTH_CLIENT_SECRET}`,
  callbackURL: "/auth/google/callback",
  
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    const userDoc = await UserModel.find({googleId: profile.id});

    if (userDoc) return done(undefined, userDoc);
    else {
      const newUser = new UserModel({
        googleId: profile.id,
        emailAddress: profile.emails?.[0].value,
        displayName: profile._json.name
      });
      await newUser.save();
      done(undefined, newUser);
    }
  } catch(err) {
    console.error(err);
    done(JSON.stringify(err), undefined);
  }
}));

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
      return next();
  }
  res.send("User not logged in");
};