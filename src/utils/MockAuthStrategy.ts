import { Strategy } from "passport";
import { authCallback } from "./loginUtils";
import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { ObjectId } from "mongodb";

export class MockAuthStrategy extends Strategy {
  constructor() {
      super();
      this.name = "mock";
  }

  async authenticate(req: any, options: any) {
      const { googleId } = req.query;
      const googleProfile = {
        id: googleId ? googleId : new ObjectId(randomInt(99999)).toString(),
        emails: [{value: faker.internet.email().toLowerCase()}],
        displayName: faker.person.fullName()
      };

      authCallback("mockToken", "mockRefresh", googleProfile, (err, user) => {
        if (err) {
          console.error(err);
          return this.error(err);
        }

        if (user) {
          req.user = user;
          return this.success(user);
        }
      });
  }
}