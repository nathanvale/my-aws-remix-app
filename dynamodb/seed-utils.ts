import { faker } from "@faker-js/faker";
import type { Product } from "~/models/product/product.server";
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

export function createProductSeed(): Omit<Product, "productId"> {
  const company = faker.helpers.unique(faker.company.name);
  const price = faker.commerce.price(100, 200);
  const description = faker.commerce.productDescription();
  return { company, price, description };
}
