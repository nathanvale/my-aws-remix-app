import { WAREHOUSE_ERROR_MESSAGES } from "../errors";

describe("USER_ERROR_MESSAGES", () => {
  test("should match inline snapshot", () => {
    expect(WAREHOUSE_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "WAREHOUSE_ALREADY_EXISTS": {
          "code": "WAREHOUSE_ALREADY_EXISTS",
          "message": "There is already an existing warehouse with this warehouseId.",
          "stausCode": 400,
        },
        "WAREHOUSE_DOES_NOT_EXIST": {
          "code": "WAREHOUSE_DOES_NOT_EXIST",
          "message": "You cannot delete a warehouse that does not exist.",
          "stausCode": 400,
        },
        "WAREHOUSE_NOT_FOUND": {
          "code": "WAREHOUSE_NOT_FOUND",
          "message": "Warehouse not found.",
          "stausCode": 400,
        },
        "WAREHOUSE_UPDATES_MUST_RETURN_VALUES": {
          "code": "WAREHOUSE_UPDATES_MUST_RETURN_VALUES",
          "message": "Warehouse updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `);
  });
});
