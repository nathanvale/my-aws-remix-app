import { SHIPMENT_ERROR_MESSAGES } from '../errors'

describe('USER_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(SHIPMENT_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "SHIPMENT_ALREADY_EXISTS": {
          "code": "SHIPMENT_ALREADY_EXISTS",
          "message": "There is already an existing shipment with this shipmentId.",
          "stausCode": 400,
        },
        "SHIPMENT_DOES_NOT_EXIST": {
          "code": "SHIPMENT_DOES_NOT_EXIST",
          "message": "You cannot delete a shipment that does not exist.",
          "stausCode": 400,
        },
        "SHIPMENT_NOT_FOUND": {
          "code": "SHIPMENT_NOT_FOUND",
          "message": "Shipment item not found.",
          "stausCode": 400,
        },
        "SHIPMENT_UPDATES_MUST_RETURN_VALUES": {
          "code": "SHIPMENT_UPDATES_MUST_RETURN_VALUES",
          "message": "Shipment item updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
