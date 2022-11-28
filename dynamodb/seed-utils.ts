import { faker } from "@faker-js/faker";
import { TEST_PRODUCT_ID, TEST_WAREHOUSE_ID } from "dynamodb/db-test-helpers";
import type { Product } from "~/models/product/product.server";
import type { User } from "~/models/user/user.server";
import type { WarehouseItem } from "~/models/warehouse-item/warehouse-item.server";

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

export function createWarehouseItemSeed(): Omit<
  WarehouseItem,
  "warehouseItemId"
> {
  const today = new Date();
  const createdAt = faker.date
    .between(
      new Date().setDate(today.getDate() - 90),
      new Date().setDate(today.getDate() - 60)
    )
    .toISOString();
  const updatedAt = faker.date
    .between(new Date().setDate(today.getDate() - 30), new Date())
    .toISOString();

  const productId = TEST_PRODUCT_ID;
  const warehouseId = TEST_WAREHOUSE_ID;
  const quantity = faker.datatype.number({ min: 1, max: 100 }).toString();
  return { createdAt, productId, quantity, updatedAt, warehouseId };
}
