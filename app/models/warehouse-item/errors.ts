import { ServerError, ErrorMessage } from "../../errors";

export type WarehouseItemErrorCodes =
  | "WAREHOUSE_ITEM_ALREADY_EXISTS"
  | "WAREHOUSE_ITEM_DOES_NOT_EXIST"
  | "WAREHOUSE_ITEM_NOT_FOUND"
  | "WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES";

export const WAREHOUSE_ITEM_ERROR_MESSAGES: ErrorMessage<WarehouseItemErrorCodes> =
  {
    WAREHOUSE_ITEM_ALREADY_EXISTS: {
      code: "WAREHOUSE_ITEM_ALREADY_EXISTS",
      stausCode: 400,
      message:
        "There is already an existing warehouse item with this warehouseItemId.",
    },
    WAREHOUSE_ITEM_DOES_NOT_EXIST: {
      code: "WAREHOUSE_ITEM_DOES_NOT_EXIST",
      stausCode: 400,
      message: "You cannot delete a warehouse item that does not exist.",
    },
    WAREHOUSE_ITEM_NOT_FOUND: {
      code: "WAREHOUSE_ITEM_NOT_FOUND",
      stausCode: 400,
      message: "Warehouse item not found.",
    },
    WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES: {
      code: "WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES",
      stausCode: 500,
      message: "Warehouse item updates must return all attributes of the item.",
    },
  };

export class WarehouseItemError extends ServerError {
  code: WarehouseItemErrorCodes;
  constructor(code: WarehouseItemErrorCodes) {
    const { stausCode, message } = WAREHOUSE_ITEM_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
