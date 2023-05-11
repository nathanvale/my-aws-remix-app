import { AppError, BaseError, ServerError } from "./errors";
import * as log from "./models/log";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(log, "logError").mockReturnValue("id");
});

describe("BaseError", () => {
  test("should create a BaseError", () => {
    const error = new BaseError("code", "message");
    expect(error).toMatchInlineSnapshot('[Error: message]');
  });
});

describe("AppError", () => {
  test("should create a BaseError", () => {
    const error = new AppError("code", "message");
    expect(error).toMatchInlineSnapshot('[Error: message]');
  });
});

describe("ServerError", () => {
  test("should create a ServerError", () => {
    const error = new ServerError("code", "message", 400);
    expect(error).toMatchInlineSnapshot('[Error: message]');
  });
});
