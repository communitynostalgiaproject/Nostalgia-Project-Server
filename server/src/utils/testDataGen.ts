import { faker } from "@faker-js/faker";
import { randomInt } from "crypto";
import { User } from "@shared/types/user";
import { Experience } from "@shared/types/experience";
import { ContentType, Flag } from "@shared/types/flag";
import { ObjectId } from "mongoose";

export const createUsers = (n: number, areModerators = false, areAdmins = false) => {
  if (n < 1) return [];

  const users = [];

  for (let i = 0; i < n; i++) {
    users.push({
      googleId: faker.string.uuid(),
      displayName: faker.person.fullName(),
      emailAddress: faker.internet.email(),
      isModerator: areModerators,
      isAdmin: areAdmins,
      joinedDate: faker.date.past()
    } as User);
  }

  return users;
};

const moods = [
  "Happy",
  "Sad",
  "Angry",
  "Anxious",
  "Relieved",
  "Confident",
  "Hopeful",
  "Frustrated",
  "Bored",
  "Excited",
  "Calm",
  "Content",
  "Overwhelmed",
  "Indifferent",
  "Nervous",
  "Grateful",
  "Guilty",
  "Fearful",
  "Joyful",
  "Lonely",
  "Curious",
  "Apathetic",
  "Optimistic",
  "Pessimistic",
  "Envious",
  "Jealous",
  "Inspired",
  "Motivated",
  "Relaxed",
  "Resentful"
];

const foodTypes = [
  "Fruits",
  "Vegetables",
  "Grains",
  "Protein",
  "Dairy",
  "Nuts and Seeds",
  "Legumes",
  "Sweets",
  "Beverages",
  "Baked Goods",
  "Snacks",
  "Fast Food",
  "Seafood",
  "Condiments",
  "Herbs and Spices",
  "Frozen Foods",
  "Canned Goods",
  "Prepared Meals",
  "International Cuisine",
  "Gluten-Free",
  "Vegan",
  "Vegetarian",
  "Organic",
  "Non-GMO",
  "Low Carb",
  "Low Fat",
  "Low Sodium",
  "High Protein",
  "Keto",
  "Paleo"
];

const peopleToBeRemindedOf = [
  "Childhood Friend",
  "High School Sweetheart",
  "College Roommate",
  "Favorite Teacher",
  "First Boss",
  "Mentor",
  "Neighbor From Home Town",
  "Summer Camp Buddy",
  "Travel Companion",
  "Family Friend",
  "Old Rival",
  "Team Captain",
  "Band Mate",
  "Art Class Partner",
  "Lab Partner",
  "Library Study Buddy",
  "First Date",
  "Dance Partner",
  "Karaoke Partner",
  "Cooking Class Pal",
  "Gym Buddy",
  "Yoga Instructor",
  "Music Teacher",
  "Sports Coach",
  "Childhood Hero",
  "Parent's Friend",
  "Cousin's Best Friend",
  "Sibling's Ex",
  "Former Colleague",
  "Chess Opponent",
  "Mother",
  "Father",
  "Sibling",
  "Brother",
  "Sister",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Cousin",
  "Niece",
  "Nephew",
  "Best Friend"
];

const flavourProfiles = [
  "Sweet",
  "Sour",
  "Salty",
  "Bitter",
  "Umami",
  "Spicy",
  "Savory",
  "Tangy",
  "Citrus",
  "Earthy",
  "Herbaceous",
  "Fruity",
  "Floral",
  "Nutty",
  "Smoky",
  "Woody",
  "Minty",
  "Creamy",
  "Rich",
  "Crisp",
  "Astringent",
  "Metallic",
  "Pungent",
  "Sharp",
  "Buttery",
  "Mellow",
  "Zesty",
  "Peppery",
  "Toasted",
  "Vanilla",
  "Chocolatey",
  "Caramel"
];

const periodOfLifeAssociations = [
  "Infancy",
  "Toddlerhood",
  "Early Childhood",
  "Middle Childhood",
  "Adolescence",
  "Early Adulthood",
  "Midlife",
  "Mature Adulthood",
  "Late Adulthood",
  "Elderly",
  "Quarter-life Crisis",
  "Midlife Crisis",
  "Empty Nest",
  "Retirement",
  "Golden Years",
  "Second Childhood",
  "Reinvention",
  "Enlightenment",
  "Self-Discovery",
  "Adventure Phase",
  "Sabbatical",
  "Legacy Building",
  "Wisdom Era",
  "Exploration Stage",
  "Reflection Period"
];

const createRandomPlaces = (n: number) => {
  if (n < 1) return [];

  const places  = [];

  for (let i = 0; i < n; i++) {
    places.push({
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
    });
  }

  return places;
}

export const createExperiences = (n: number, userIds: ObjectId[] = []) => {
  if (n < 1) return [];

  const experiences = [];

  for (let i = 0; i < n; i++) {
    const createdDate = faker.date.past().toISOString();
    experiences.push({
      title: faker.lorem.words(randomInt(3, 6)),
      place: createRandomPlaces(1)[0],
      description: faker.lorem.paragraphs({
        min: 1,
        max: 12
      }),
      createdDate,
      experienceDate: faker.date.past({
        refDate: createdDate
      }).toISOString(),
      mood: moods[randomInt(moods.length)],
      foodtype: foodTypes[randomInt(foodTypes.length)],
      personItRemindsThemOf: peopleToBeRemindedOf[randomInt(peopleToBeRemindedOf.length)],
      flavourProfile: flavourProfiles[randomInt(flavourProfiles.length)],
      periodOfLifeAssociation: periodOfLifeAssociations[randomInt(periodOfLifeAssociations.length)],
      placesToGetFood: createRandomPlaces(randomInt(3)),
      creatorId: userIds.length ? userIds[randomInt(userIds.length)] : undefined
    } as Experience);
  }

  return experiences;
};

export const createFlags = (n: number, experienceIds: ObjectId[], userIds: ObjectId[]) => {
  if (n < 1) return [];

  const flags = [];

  for (let i = 0; i < n; i++) {
    flags.push({
      contentId: experienceIds[randomInt(experienceIds.length)],
      contentType: "Experience",
      userId: userIds[randomInt(userIds.length)],
      createdDate: faker.date.past(),
      priority: ["low", "medium", "high"][randomInt(3)],
      reason: ["spam", "hate-speech", "misinformation", "other"][randomInt(4)],
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