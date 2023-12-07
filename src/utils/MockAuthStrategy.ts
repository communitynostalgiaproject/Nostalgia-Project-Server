import { Strategy } from "passport";
import UserModel from "../models/user.model";

export class MockAuthStrategy extends Strategy {
  constructor() {
      super();
      this.name = 'mock';
  }

  async authenticate(req: any, options: any) {
      const { isAdmin, isModerator } = req.query;
      const user = {
        googleId: "12345",
        emailAddress: "test.user@fake.com",
        displayName: "Test User",
        isModerator: isModerator && isModerator === "true",
        isAdmin: isAdmin && isAdmin === "true"
      };

      try {
        const mockUser = await new UserModel(user).save();
        this.success(mockUser);
      } catch(err) {
        console.log(`Failed to add mock user to database: ${err}`);
        this.fail();
      }
  }
}