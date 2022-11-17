import { ServerError } from "../errors";
import { ErrorMessage } from "../errors";

export type UserErrorCodes =
  | "USER_ALREADY_EXISTS"
  | "USER_DOES_NOT_EXIST"
  | "USER_NOT_FOUND"
  | "USER_PASSWORD_INVALID"
  | "USER_UPDATES_MUST_RETURN_VALUES";

export const USER_ERROR_MESSAGES: ErrorMessage<UserErrorCodes> = {
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    stausCode: 400,
    message: "There is already an existing user with this email address.",
  },
  USER_DOES_NOT_EXIST: {
    code: "USER_DOES_NOT_EXIST",
    stausCode: 400,
    message: "You cannot delete a user that does not exist.",
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    stausCode: 400,
    message: "User not found.",
  },
  USER_PASSWORD_INVALID: {
    code: "USER_PASSWORD_INVALID",
    stausCode: 400,
    message: "Invalid pasword.",
  },
  USER_UPDATES_MUST_RETURN_VALUES: {
    code: "USER_UPDATES_MUST_RETURN_VALUES",
    stausCode: 500,
    message: "User updates must return all attributes of the item.",
  },
};

export class UserError extends ServerError {
  code: UserErrorCodes;
  constructor(code: UserErrorCodes) {
    const { stausCode, message } = USER_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
