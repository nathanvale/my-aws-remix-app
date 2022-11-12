import { AWSError } from "aws-sdk";
import { logError } from "./log";

/**
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html
 */
export enum AWSErrorCodes {
  CONDITIONAL_CHECK_FAILED_EXCEPTION = "ConditionalCheckFailedException",
}

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

export class BaseError {
  id: string;
  code: string;
  message: string;
  constructor(code: string, message: string) {
    this.id = logError();
    this.code = code;
    this.message = message;
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

export class UnknownError extends AppError implements ServerError {
  statusCode: number;
  constructor(error: unknown) {
    let statusCode = 0;
    let code;
    if ((error as AWSError).time) {
      statusCode = (error as AWSError).statusCode || 0;
      code = (error as AWSError).code;
    } else {
      code =
        (error as UnknownError)?.code ||
        (error as Error).name ||
        "UnknownError";
    }
    super(code, (error as AWSError | Error).message, (error as Error).stack);
    this.statusCode = statusCode;
  }
}
