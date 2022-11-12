import { vi, SpyInstance, Mock } from "vitest";
import { redirect } from "@remix-run/server-runtime";
import {
  createUserSession,
  getUserFromSession,
  getUserIdFromSession,
  requireUser,
  requireUserId,
  USER_SESSION_KEY,
} from "./session.server";
import * as getSession from "./get-session";
import { TEST_USER_ID } from "../../test/db-test-helpers";
import * as logout from "./logout";

vi.mock("@remix-run/server-runtime");

let logoutSpy: SpyInstance;
let getSessionSpy: SpyInstance;
let sessionGetSpy = vi.fn();
let sessionSetSpy = vi.fn();

const LOCALHOST = "https://localhost:3000";

beforeEach(() => {
  vi.restoreAllMocks();
  logoutSpy = vi.spyOn(logout, "logout");
  getSessionSpy = vi.spyOn(getSession, "getSession").mockResolvedValue({
    get: sessionGetSpy,
    data: vi.fn(),
    flash: vi.fn(),
    has: vi.fn(),
    set: sessionSetSpy,
    unset: vi.fn(),
    id: "",
  });
});

describe("sessionStorage", () => {
  test("should with called with a cookie", () => {
    expect(USER_SESSION_KEY).toBe("userId");
  });
});

describe("getUserIdFromSession", () => {
  test("should get a userId", async () => {
    sessionGetSpy.mockResolvedValue(TEST_USER_ID);
    const request = new Request("https://localhost:3000");
    const result = await getUserIdFromSession(request);
    expect(getSessionSpy).toBeCalledWith(request);
    expect(sessionGetSpy).toBeCalledWith(USER_SESSION_KEY);
    expect(result).toBe(TEST_USER_ID);
  });
});

describe("getUserFromSession", () => {
  test("should return null when there is no user on the session", async () => {
    const userId = null;
    sessionGetSpy.mockResolvedValue(userId);
    const request = new Request(LOCALHOST);
    const result = await getUserFromSession(request);
    expect(result).toBeNull();
  });
  test("should read a user when a session returns a user", async () => {
    const userId = TEST_USER_ID;
    sessionGetSpy.mockResolvedValue(userId);
    const request = new Request(LOCALHOST);
    const result = await getUserFromSession(request);
    expect(result).toMatchInlineSnapshot(`
      {
        "campaignCount": 0,
        "email": "test@test.com",
        "firstName": "",
        "lastName": "",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "userId": "12345",
      }
    `);
  });

  test("should throw and call logout with the request when the user is unknown", async () => {
    sessionGetSpy.mockResolvedValue("unknownUserId");
    const request = new Request(LOCALHOST);
    await getError(async () => getUserFromSession(request));
    expect(logoutSpy).toBeCalledWith(request);
  });
});

describe("requireUserId", () => {
  test("should require a userId", async () => {
    sessionGetSpy.mockResolvedValue(TEST_USER_ID);
    const request = new Request(LOCALHOST);
    const result = await requireUserId(request, "/redirectTo");
    expect(result).toBe(TEST_USER_ID);
  });

  test("should redirect user with redirect search params to the login page", async () => {
    sessionGetSpy.mockResolvedValue(null);
    (redirect as Mock).mockResolvedValue("");
    const request = new Request("https://localhost:3000/dashboard");
    await getError(async () => requireUserId(request));
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login?redirectTo=%2Fdashboard");
  });

  test("should redirect user with specified redirect search params to the login page", async () => {
    sessionGetSpy.mockResolvedValue(null);
    (redirect as Mock).mockResolvedValue("");
    const request = new Request(LOCALHOST);
    await getError(async () => requireUserId(request, "/dashboard"));
    expect(redirect).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/login?redirectTo=%2Fdashboard");
  });
});

describe("requireUser", () => {
  test("should require a user", async () => {
    sessionGetSpy.mockResolvedValue(TEST_USER_ID);
    const request = new Request(LOCALHOST);
    const result = await requireUser(request);
    expect(result).toMatchInlineSnapshot(`
      {
        "campaignCount": 0,
        "email": "test@test.com",
        "firstName": "",
        "lastName": "",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "userId": "12345",
      }
    `);
  });
  test("should throw and call logout with the request when the user is unknown", async () => {
    sessionGetSpy.mockResolvedValue("unknownUserId");
    const request = new Request(LOCALHOST);
    await getError(async () => requireUser(request));
    expect(logoutSpy).toBeCalledWith(request);
  });

  describe("createUserSession", () => {
    const request = new Request(LOCALHOST);
    const userId = TEST_USER_ID;
    const redirectTo = "/dashboard";
    test("should create a user session without remembering the session", async () => {
      await createUserSession({
        request,
        userId,
        remember: false,
        redirectTo,
      });
      expect(sessionSetSpy).toBeCalledWith(USER_SESSION_KEY, TEST_USER_ID);
      expect(redirect).toBeCalledWith(redirectTo, {
        headers: {
          "Set-Cookie":
            "__session=dW5kZWZpbmVk.aTVDcuulOOQZcjAdiGfuDCZlVYkNGmSOEkC%2Fm2SDKG4; Path=/; HttpOnly; SameSite=Lax",
        },
        status: 302,
      });
    });
    test("should create a user session that last 7 days", async () => {
      await createUserSession({
        request,
        userId,
        remember: true,
        redirectTo,
      });
      expect(sessionSetSpy).toBeCalledWith(USER_SESSION_KEY, TEST_USER_ID);
      expect(redirect).toBeCalledWith(redirectTo, {
        headers: {
          "Set-Cookie":
            "__session=dW5kZWZpbmVk.aTVDcuulOOQZcjAdiGfuDCZlVYkNGmSOEkC%2Fm2SDKG4; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax",
        },
        status: 302,
      });
    });
  });
});
