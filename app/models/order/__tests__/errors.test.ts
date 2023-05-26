import { ORDER_ERROR_MESSAGES } from '../errors.ts'

describe('USER_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(ORDER_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "ORDER_ALREADY_EXISTS": {
          "code": "ORDER_ALREADY_EXISTS",
          "message": "There is already an existing order with this orderId.",
          "stausCode": 400,
        },
        "ORDER_DOES_NOT_EXIST": {
          "code": "ORDER_DOES_NOT_EXIST",
          "message": "You cannot delete a order that does not exist.",
          "stausCode": 400,
        },
        "ORDER_NOT_FOUND": {
          "code": "ORDER_NOT_FOUND",
          "message": "Order not found.",
          "stausCode": 400,
        },
        "ORDER_UPDATES_MUST_RETURN_VALUES": {
          "code": "ORDER_UPDATES_MUST_RETURN_VALUES",
          "message": "Order updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
