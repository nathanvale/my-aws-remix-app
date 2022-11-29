import { ServerError } from "../../errors";
import { ErrorMessage } from "../../errors";

export type WarehouseErrorCodes =
  | "WAREHOUSE_ALREADY_EXISTS"
  | "WAREHOUSE_DOES_NOT_EXIST"
  | "WAREHOUSE_NOT_FOUND"
  | "WAREHOUSE_UPDATES_MUST_RETURN_VALUES";

export const WAREHOUSE_ERROR_MESSAGES: ErrorMessage<WarehouseErrorCodes> = {
  WAREHOUSE_ALREADY_EXISTS: {
    code: "WAREHOUSE_ALREADY_EXISTS",
    stausCode: 400,
    message: "There is already an existing warehouse with this warehouseId.",
  },
  WAREHOUSE_DOES_NOT_EXIST: {
    code: "WAREHOUSE_DOES_NOT_EXIST",
    stausCode: 400,
    message: "You cannot delete a warehouse that does not exist.",
  },
  WAREHOUSE_NOT_FOUND: {
    code: "WAREHOUSE_NOT_FOUND",
    stausCode: 400,
    message: "Warehouse not found.",
  },
  WAREHOUSE_UPDATES_MUST_RETURN_VALUES: {
    code: "WAREHOUSE_UPDATES_MUST_RETURN_VALUES",
    stausCode: 500,
    message: "Warehouse updates must return all attributes of the item.",
  },
};

export class WarehouseError extends ServerError {
  code: WarehouseErrorCodes;
  constructor(code: WarehouseErrorCodes) {
    const { stausCode, message } = WAREHOUSE_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
