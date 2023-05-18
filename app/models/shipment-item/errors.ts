import { ServerError, ErrorMessage } from "../../errors";

export type ShipmentItemErrorCodes =
  | "SHIPMENT_ITEM_ALREADY_EXISTS"
  | "SHIPMENT_ITEM_DOES_NOT_EXIST"
  | "SHIPMENT_ITEM_NOT_FOUND"
  | "SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES";

export const SHIPMENT_ITEM_ITEM_ERROR_MESSAGES: ErrorMessage<ShipmentItemErrorCodes> =
  {
    SHIPMENT_ITEM_ALREADY_EXISTS: {
      code: "SHIPMENT_ITEM_ALREADY_EXISTS",
      stausCode: 400,
      message:
        "There is already an existing shipment item with this shipmentItemId.",
    },
    SHIPMENT_ITEM_DOES_NOT_EXIST: {
      code: "SHIPMENT_ITEM_DOES_NOT_EXIST",
      stausCode: 400,
      message: "You cannot delete a shipment item that does not exist.",
    },
    SHIPMENT_ITEM_NOT_FOUND: {
      code: "SHIPMENT_ITEM_NOT_FOUND",
      stausCode: 400,
      message: "Shipment item not found.",
    },
    SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES: {
      code: "SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES",
      stausCode: 500,
      message: "Shipment item updates must return all attributes of the item.",
    },
  };

export class ShipmentItemError extends ServerError {
  code: ShipmentItemErrorCodes;
  constructor(code: ShipmentItemErrorCodes) {
    const { stausCode, message } = SHIPMENT_ITEM_ITEM_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
