import { faker } from "@faker-js/faker";
import type { User } from "~/models/user/user.server";

export function createUserSeed(): Omit<User, "userId"> {
  const firstName = faker.helpers.unique(faker.name.firstName);
  const lastName = faker.helpers.unique(faker.name.lastName);

  const username = faker.internet.userName(
    firstName.toLowerCase(),
    lastName.toLowerCase()
  );

  return {
    email: faker.internet.exampleEmail(
      firstName.toLowerCase(),
      lastName.toLowerCase()
    ),
    name: `${firstName} ${lastName}`,
    username,
    password: faker.internet.password(),
  };
}
