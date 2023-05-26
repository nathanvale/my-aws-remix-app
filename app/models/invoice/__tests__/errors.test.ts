import { INVOICE_ERROR_MESSAGES } from '../errors.ts'

describe('USER_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(INVOICE_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "INVOICE_ALREADY_EXISTS": {
          "code": "INVOICE_ALREADY_EXISTS",
          "message": "There is already an existing invoice with this invoiceId.",
          "stausCode": 400,
        },
        "INVOICE_DOES_NOT_EXIST": {
          "code": "INVOICE_DOES_NOT_EXIST",
          "message": "You cannot delete a invoice that does not exist.",
          "stausCode": 400,
        },
        "INVOICE_NOT_FOUND": {
          "code": "INVOICE_NOT_FOUND",
          "message": "Invoice item not found.",
          "stausCode": 400,
        },
        "INVOICE_UPDATES_MUST_RETURN_VALUES": {
          "code": "INVOICE_UPDATES_MUST_RETURN_VALUES",
          "message": "Invoice item updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
