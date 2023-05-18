import { ServerError, ErrorMessage } from "../../errors";

export type OrderItemErrorCodes =
  | "ORDER_ITEM_ALREADY_EXISTS"
  | "ORDER_ITEM_DOES_NOT_EXIST"
  | "ORDER_ITEM_NOT_FOUND"
  | "ORDER_ITEM_UPDATES_MUST_RETURN_VALUES";

export const ORDER_ITEM_ERROR_MESSAGES: ErrorMessage<OrderItemErrorCodes> = {
  ORDER_ITEM_ALREADY_EXISTS: {
    code: "ORDER_ITEM_ALREADY_EXISTS",
    stausCode: 400,
    message: "There is already an existing order item with this orderItemId.",
  },
  ORDER_ITEM_DOES_NOT_EXIST: {
    code: "ORDER_ITEM_DOES_NOT_EXIST",
    stausCode: 400,
    message: "You cannot delete a order item that does not exist.",
  },
  ORDER_ITEM_NOT_FOUND: {
    code: "ORDER_ITEM_NOT_FOUND",
    stausCode: 400,
    message: "Order item not found.",
  },
  ORDER_ITEM_UPDATES_MUST_RETURN_VALUES: {
    code: "ORDER_ITEM_UPDATES_MUST_RETURN_VALUES",
    stausCode: 500,
    message: "Order item updates must return all attributes of the item.",
  },
};

export class OrderItemError extends ServerError {
  code: OrderItemErrorCodes;
  constructor(code: OrderItemErrorCodes) {
    const { stausCode, message } = ORDER_ITEM_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
