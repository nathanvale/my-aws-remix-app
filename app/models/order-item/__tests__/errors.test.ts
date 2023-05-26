import { ORDER_ITEM_ERROR_MESSAGES } from '../errors.ts'

describe('ORDER_ITEM_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(ORDER_ITEM_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "ORDER_ITEM_ALREADY_EXISTS": {
          "code": "ORDER_ITEM_ALREADY_EXISTS",
          "message": "There is already an existing order item with this orderItemId.",
          "stausCode": 400,
        },
        "ORDER_ITEM_DOES_NOT_EXIST": {
          "code": "ORDER_ITEM_DOES_NOT_EXIST",
          "message": "You cannot delete a order item that does not exist.",
          "stausCode": 400,
        },
        "ORDER_ITEM_NOT_FOUND": {
          "code": "ORDER_ITEM_NOT_FOUND",
          "message": "Order item not found.",
          "stausCode": 400,
        },
        "ORDER_ITEM_UPDATES_MUST_RETURN_VALUES": {
          "code": "ORDER_ITEM_UPDATES_MUST_RETURN_VALUES",
          "message": "Order item updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
