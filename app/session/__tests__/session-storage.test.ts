import { vi } from "vitest";

vi.mock("@remix-run/node", () => {
  return {
    createCookieSessionStorage: vi.fn().mockImplementation((value) => value),
    getSession: vi.fn(),
    commitSession: vi.fn(),
    destroySession: vi.fn(),
  };
});

describe("sessionStorage", () => {
  test("should get a session", async () => {
    const { sessionStorage } = await import("../session-storage");
    expect(sessionStorage).toMatchInlineSnapshot(`
      {
        "cookie": {
          "httpOnly": true,
          "name": "_session",
          "path": "/",
          "sameSite": "lax",
          "secrets": [
            "shhhhhhhhh",
          ],
          "secure": false,
        },
      }
    `);
  });
});
