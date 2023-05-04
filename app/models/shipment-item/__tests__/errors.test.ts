import { SHIPMENT_ITEM_ITEM_ERROR_MESSAGES } from "../errors";

describe("USER_ERROR_MESSAGES", () => {
  test("should match inline snapshot", () => {
    expect(SHIPMENT_ITEM_ITEM_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "SHIPMENT_ITEM_ALREADY_EXISTS": {
          "code": "SHIPMENT_ITEM_ALREADY_EXISTS",
          "message": "There is already an existing shipment item with this shipmentItemId.",
          "stausCode": 400,
        },
        "SHIPMENT_ITEM_DOES_NOT_EXIST": {
          "code": "SHIPMENT_ITEM_DOES_NOT_EXIST",
          "message": "You cannot delete a shipment item that does not exist.",
          "stausCode": 400,
        },
        "SHIPMENT_ITEM_NOT_FOUND": {
          "code": "SHIPMENT_ITEM_NOT_FOUND",
          "message": "Shipment item not found.",
          "stausCode": 400,
        },
        "SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES": {
          "code": "SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES",
          "message": "Shipment item updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `);
  });
});
