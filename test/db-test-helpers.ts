export const TEST_USER_EMAIL = "test@test.com";
export const TEST_USER_ID = "12345";

export const clientApiMethodReject = (
  apiMethod: "query" | "putItem" | "getItem" | "updateItem" | "deleteItem",
  error: unknown
) =>
  ({
    client: {
      [apiMethod]: () => ({
        promise: () => Promise.reject(error),
      }),
    },
  } as any);

export const clientApiMethodResolve = (
  apiMethod: "query" | "putItem" | "getItem" | "updateItem" | "deleteItem",
  response: unknown
) =>
  ({
    client: {
      [apiMethod]: () => ({
        promise: () => Promise.resolve(response),
      }),
    },
  } as any);