import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { MockAuthStrategy } from '../utils/MockAuthStrategy';
import UserModel from '../models/user.model';
import { User } from '@projectTypes/user';

 const configurePassport = (passport: PassportStatic) => {
  // Define user (de-)serialization methods
  passport.serializeUser<any, any>((req, user, done) => {
    done(undefined, user);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const userDoc = await UserModel.findById(id) as User;
      done(undefined, userDoc);
    } catch(err) {
      done(err, undefined);
    }
  });

  // Set mock strategy for testing
  if (process.env.NODE_ENV === "test") {  
    passport.use(new MockAuthStrategy());
    return;
  }

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
  }));
}

export default configurePassport;