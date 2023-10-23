import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { User } from "@shared/types/user";
import { Experience } from "@shared/types/experience";
import { ContentType, Flag } from "@shared/types/flag";
import { ObjectId } from "mongoose";

export const createUsers = (n: number) => {
  if (n < 1) return [];

  const users = [];

  for (let i = 0; i < n; i++) {
    users.push({
      googleId: faker.string.uuid(),
      displayName: faker.name.fullName(),
      emailAddress: faker.internet.email(),
      isModerator: Boolean(randomInt(2)),
      isAdmin: Boolean(randomInt(2)),
      joinedDate: faker.date.past()
    } as User);
  }

  return users;
};

export const createExperiences = (n: number) => {
  if (n < 1) return [];

  const experiences = [];

  for (let i = 0; i < n; i++) {
    experiences.push({
      title: faker.lorem.words(randomInt(3, 6)),
      place: {
        address: {
          gid: faker.string.uuid(),
          sourceId: faker.string.uuid(),
          name: faker.location.streetAddress(),
          accuracy: "point",
          country: faker.location.country(),
          street: faker.location.street(),
          locality: faker.location.city()
        },
        location: {
          type: "Point",
          coordinates: [
            faker.location.latitude(),
            faker.location.longitude()
          ]
        }
      },
      description: faker.lorem.paragraphs({
        min: 1,
        max: 3
      }),
      experienceDate: faker.date.past().toISOString()
    } as Experience);
  }

  return experiences;
};

export const createFlags = (
  contentId: ObjectId,
  contentType: ContentType,
  userId: number,
  n: number  
) => {
  if (n < 1) return [];

  const flags = [];

  for (let i = 0; i < n; i++) {
    flags.push({
      contentId,
      contentType,
      userId,
      createdDate: faker.date.past(),
      priority: ["low", "medium", "high"][randomInt(3)],
      reason: ["spam", "hate-speech", "misinformation", "other"][4],
      userComment: faker.lorem.sentences({
        min: 1,
        max: 6
      }),
      moderatorComments: [],
      resolved: false
    });
  }

  return flags;
};