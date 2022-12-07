import { ServerError } from "../../errors";
import { ErrorMessage } from "../../errors";

export type OrderErrorCodes =
  | "ORDER_ALREADY_EXISTS"
  | "ORDER_DOES_NOT_EXIST"
  | "ORDER_NOT_FOUND"
  | "ORDER_UPDATES_MUST_RETURN_VALUES";

export const ORDER_ERROR_MESSAGES: ErrorMessage<OrderErrorCodes> = {
  ORDER_ALREADY_EXISTS: {
    code: "ORDER_ALREADY_EXISTS",
    stausCode: 400,
    message: "There is already an existing order with this orderId.",
  },
  ORDER_DOES_NOT_EXIST: {
    code: "ORDER_DOES_NOT_EXIST",
    stausCode: 400,
    message: "You cannot delete a order that does not exist.",
  },
  ORDER_NOT_FOUND: {
    code: "ORDER_NOT_FOUND",
    stausCode: 400,
    message: "Order not found.",
  },
  ORDER_UPDATES_MUST_RETURN_VALUES: {
    code: "ORDER_UPDATES_MUST_RETURN_VALUES",
    stausCode: 500,
    message: "Order updates must return all attributes of the item.",
  },
};

export class OrderError extends ServerError {
  code: OrderErrorCodes;
  constructor(code: OrderErrorCodes) {
    const { stausCode, message } = ORDER_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
