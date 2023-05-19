import { WAREHOUSE_ITEM_ERROR_MESSAGES } from '../errors'

describe('USER_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(WAREHOUSE_ITEM_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "WAREHOUSE_ITEM_ALREADY_EXISTS": {
          "code": "WAREHOUSE_ITEM_ALREADY_EXISTS",
          "message": "There is already an existing warehouse item with this warehouseItemId.",
          "stausCode": 400,
        },
        "WAREHOUSE_ITEM_DOES_NOT_EXIST": {
          "code": "WAREHOUSE_ITEM_DOES_NOT_EXIST",
          "message": "You cannot delete a warehouse item that does not exist.",
          "stausCode": 400,
        },
        "WAREHOUSE_ITEM_NOT_FOUND": {
          "code": "WAREHOUSE_ITEM_NOT_FOUND",
          "message": "Warehouse item not found.",
          "stausCode": 400,
        },
        "WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES": {
          "code": "WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES",
          "message": "Warehouse item updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
