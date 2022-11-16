import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createUserSeed } from "dynamodb/seed-utils";
import { createUser } from "~/models/user/user.server";
import { createUserSession } from "~/session/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨 test routes should not be enabled in production 🚨 🚨 🚨 🚨 🚨 🚨 🚨 🚨"
    );
    // test routes should not be enabled in production or without
    // enable test routes... Just in case this somehow slips through
    // we'll redirect :)
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }

  const { email } = await request.json();
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const result = await createUser(createUserSeed());

  if (result.ok) {
    const user = result.val;

    return createUserSession({
      request,
      userId: user.userId,
      remember: true,
      redirectTo: "/",
    });
  } else throw result.val;
};

export default null;
