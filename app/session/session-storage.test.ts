import { Mock, vi } from "vitest";
import { createCookieSessionStorage } from "@remix-run/node";
import { sessionStorage } from "./session-storage";
vi.mock("@remix-run/node");

describe("sessionStorage", () => {
  test("should get a session", async () => {
    (createCookieSessionStorage as Mock).mockReturnValue({});
    expect(sessionStorage).toBe(undefined);
    expect(createCookieSessionStorage as Mock).toBeCalledWith({
      cookie: {
        httpOnly: true,
        name: "__session",
        path: "/",
        sameSite: "lax",
        secrets: ["shhhhhhhhh"],
        secure: false,
      },
    });
  });
});
