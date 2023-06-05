import { SESSION_ERROR_MESSAGES } from '../errors'

describe('SESSION_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(SESSION_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "SESSION_ALREADY_EXISTS": {
          "code": "SESSION_ALREADY_EXISTS",
          "message": "There is already an existing session with this sessionId.",
          "stausCode": 400,
        },
        "SESSION_DOES_NOT_EXIST": {
          "code": "SESSION_DOES_NOT_EXIST",
          "message": "You cannot delete a session that does not exist.",
          "stausCode": 400,
        },
        "SESSION_NOT_FOUND": {
          "code": "SESSION_NOT_FOUND",
          "message": "Product not found.",
          "stausCode": 400,
        },
        "SESSION_UPDATES_MUST_RETURN_VALUES": {
          "code": "SESSION_UPDATES_MUST_RETURN_VALUES",
          "message": "Session updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
