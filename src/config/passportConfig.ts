import { PassportStatic } from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { MockAuthStrategy } from '../utils/MockAuthStrategy';
import UserModel from '../models/user.model';
import { User } from '@projectTypes/user';
import { authCallback } from '../utils/loginUtils';

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

  passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_AUTH_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_AUTH_CLIENT_SECRET}`,
    callbackURL: "/auth/google/callback",
  }, authCallback));
}

export default configurePassport;