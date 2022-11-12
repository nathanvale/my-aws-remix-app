import { sessionStorage } from "./session-storage";
import type { User } from "~/models/user/user.server";
import { readUser } from "~/models/user/user.server";
import { logout } from "./logout";
import { redirect } from "@remix-run/server-runtime";
import { getSession } from "./get-session";

export const USER_SESSION_KEY = "userId";

/**
 * Get the userId stored in the session cookie.
 * @param request
 * @returns
 */
export async function getUserIdFromSession(
  request: Request
): Promise<User["userId"] | null> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY) as User["userId"];
  return userId;
}

/**
 * Gets a user from the session cookie and performs a logout
 * immediately if no user is found.
 * @param request
 * @returns
 */
export async function getUserFromSession(
  request: Request
): Promise<User | null> {
  const userId = await getUserIdFromSession(request);
  if (!userId) return null;

  const result = await readUser(userId);
  if (result.ok) {
    const user = result.val;
    return user;
  } else {
    throw await logout(request);
  }
}

/**
 * Gets a userId from the session cookie and redirects to the login page
 * with a redirectTo search param if one is not found.
 * @param request
 * @param redirectTo
 * @returns
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname //?
): Promise<User["userId"]> {
  const userId = await getUserIdFromSession(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

/**
 * Gets a userId from the session cookie and redirects to the login page
 * with a redirectTo search param if one is not found. It then uses
 * that userId to find that user in the database. If that user is not
 * found then a logout is performed. If it is found then the user item
 * is returned.
 * @param request
 * @param redirectTo
 * @returns
 */
export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<User> {
  const userId = await requireUserId(request, redirectTo);
  const result = await readUser(userId);

  if (result.ok) {
    const user = result.val;
    return user;
  } else {
    throw await logout(request);
  }
}

/**
 * Creates a user session with the option to remember it for 7 days and
 * then redirects the user to the redirectTo param.
 * @param param0
 * @returns
 */
export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: User["userId"];
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }), //?
    },
  });
}
