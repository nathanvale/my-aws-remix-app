import { logError } from "./models/log";

export type AppErrorCodes = "APP_NO_USER_FOUND";

export type ErrorMessage<T extends string> = Record<
  T,
  { code: T; stausCode: number; message: string }
>;

export const APP_ERROR_MESSAGES: ErrorMessage<AppErrorCodes> = {
  APP_NO_USER_FOUND: {
    code: "APP_NO_USER_FOUND",
    stausCode: 0,
    message:
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
  },
};

export class BaseError extends Error {
  id: string;
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.id = logError();
    this.code = code;
  }
}
export class AppError extends BaseError {
  stack: string | undefined;

  constructor(code: string, message: string, stack?: string) {
    super(code, message);
    this.stack = stack || "";
  }
}

export class ServerError extends BaseError {
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(code, message);
    this.statusCode = statusCode;
  }
}
