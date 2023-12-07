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
        isModerator: isModerator ? true : false,
        isAdmin: isAdmin ? true : false
      };

      try {
        const mockUser = await new UserModel(user).save();
        this.success({
          ...user,
          _id: mockUser._id
        });
      } catch(err) {
        console.log("Failed to add mock user to database");
        this.fail();
      }
  }
}