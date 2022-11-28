import { PRODUCT_ERROR_MESSAGES } from "../errors";

describe("USER_ERROR_MESSAGES", () => {
  test("should match inline snapshot", () => {
    expect(PRODUCT_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "PRODUCT_ALREADY_EXISTS": {
          "code": "PRODUCT_ALREADY_EXISTS",
          "message": "There is already an existing product with this productId.",
          "stausCode": 400,
        },
        "PRODUCT_DOES_NOT_EXIST": {
          "code": "PRODUCT_DOES_NOT_EXIST",
          "message": "You cannot delete a product that does not exist.",
          "stausCode": 400,
        },
        "PRODUCT_NOT_FOUND": {
          "code": "PRODUCT_NOT_FOUND",
          "message": "Product not found.",
          "stausCode": 400,
        },
        "PRODUCT_UPDATES_MUST_RETURN_VALUES": {
          "code": "PRODUCT_UPDATES_MUST_RETURN_VALUES",
          "message": "Product updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `);
  });
});
