
describe("getError", () => {
  test("should get an error", async () => {
    const result = await getError(() => {});
    expect(result).toMatchInlineSnapshot("[Error]");
  });
});

// eslint-disable-next-line jest/no-export
export {};
