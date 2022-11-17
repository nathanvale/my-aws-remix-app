import { test as baseTest, Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { createUserSeed } from "../dynamodb/seed-utils";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  User,
} from "~/models/user/user.server";
import { commitSession, getSession } from "~/session/session-storage";
import { parse } from "cookie";
import { USER_SESSION_KEY } from "~/session/session.server";
import { ulid } from "ulid";
export { expect } from "@playwright/test";

type LoginForm = {
  email: string;
  password: string;
  name: string;
  username: string;
};

export const dataCleanup = {
  users: new Set<string>(),
};

export function makeLoginForm(
  overrides: Partial<LoginForm> | undefined = {}
): LoginForm {
  const firstName =
    overrides.name?.split(" ")?.[0] ||
    faker.helpers.unique(faker.name.firstName);
  const lastName =
    overrides.name?.split(" ")?.[1] ||
    faker.helpers.unique(faker.name.lastName);
  const username =
    overrides.username ||
    faker.internet.userName(firstName.toLowerCase(), lastName.toLowerCase());
  return {
    name: overrides.name || `${firstName} ${lastName}`,
    username,
    email: ulid() + "@example.com",
    password: faker.internet.password(),
  };
}

export async function insertNewUser({ password }: { password?: string } = {}) {
  const userData = createUserSeed();
  const user = await createUser({
    ...userData,
    password: password ?? userData.password,
  });
  dataCleanup.users.add(user.userId);
  return user;
}

export async function deleteUserByEmail(email: string) {
  const user = await getUserByEmail(email);
  try {
    await deleteUser(user.userId);
  } catch (error) {
    console.log(error);
  }
}

export const test = baseTest.extend<{
  login: () => ReturnType<typeof loginPage>;
}>({
  login: [
    async ({ page, baseURL }, use) => {
      use(() => loginPage({ page, baseURL }));
    },
    { auto: true },
  ],
});

export async function loginPage({
  page,
  baseURL,
  user,
}: {
  page: Page;
  baseURL: string | undefined;
  user?: User;
}) {
  user = user ?? (await insertNewUser());
  const session = await getSession();
  session.set(USER_SESSION_KEY, user.userId);
  const cookieValue = await commitSession(session);
  const { _session } = parse(cookieValue);
  page.context().addCookies([
    {
      name: "_session",
      sameSite: "Lax",
      url: baseURL,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      value: _session,
    },
  ]);
  return user;
}
