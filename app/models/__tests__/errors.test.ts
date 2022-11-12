import { AppError, BaseError, UnknownError } from "../errors";
import * as log from "../log";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(log, "logError").mockReturnValue("id");
});

describe("BaseError", () => {
  test("should create a BaseError", () => {
    const error = new BaseError("code", "message");
    expect(error).toMatchInlineSnapshot(`
      BaseError {
        "code": "code",
        "id": "id",
        "message": "message",
      }
    `);
  });
});

describe("AppError", () => {
  test("should create a BaseError", () => {
    const error = new AppError("code", "message");
    expect(error).toMatchInlineSnapshot(`
      AppError {
        "code": "code",
        "id": "id",
        "message": "message",
        "stack": "",
      }
    `);
  });
});

describe("UnknownError", () => {
  test("should create an UnknownError with an AWS error", () => {
    const error = new UnknownError({
      time: new Date().toISOString,
      statusCode: 999,
    });
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": undefined,
        "id": "id",
        "message": undefined,
        "stack": "",
        "statusCode": 999,
      }
    `);
  });
  test("should create an UnknownError with an AWS error with no status code", () => {
    const error = new UnknownError({
      time: new Date().toISOString,
    });
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": undefined,
        "id": "id",
        "message": undefined,
        "stack": "",
        "statusCode": 0,
      }
    `);
  });
  test("should create an UnknownError with an error with no status code or name", () => {
    const error = new UnknownError({ message: "Fatal error" });
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "UnknownError",
        "id": "id",
        "message": "Fatal error",
        "stack": "",
        "statusCode": 0,
      }
    `);
  });
});
