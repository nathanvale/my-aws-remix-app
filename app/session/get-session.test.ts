import { getSession } from "./get-session";

describe("getStorage", () => {
  test("should get a session", async () => {
    const request = new Request("https://localhost:3000");
    const result = await getSession(request);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {},
        "flash": [Function],
        "get": [Function],
        "has": [Function],
        "id": "",
        "set": [Function],
        "unset": [Function],
      }
    `);
  });
});
