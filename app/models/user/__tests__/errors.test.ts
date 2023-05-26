import { USER_ERROR_MESSAGES } from '../errors.ts'

describe('USER_ERROR_MESSAGES', () => {
	test('should match inline snapshot', () => {
		expect(USER_ERROR_MESSAGES).toMatchInlineSnapshot(`
      {
        "USER_ALREADY_EXISTS": {
          "code": "USER_ALREADY_EXISTS",
          "message": "There is already an existing user with this email address.",
          "stausCode": 400,
        },
        "USER_DOES_NOT_EXIST": {
          "code": "USER_DOES_NOT_EXIST",
          "message": "You cannot delete a user that does not exist.",
          "stausCode": 400,
        },
        "USER_NOT_FOUND": {
          "code": "USER_NOT_FOUND",
          "message": "User not found.",
          "stausCode": 400,
        },
        "USER_PASSWORD_INVALID": {
          "code": "USER_PASSWORD_INVALID",
          "message": "Invalid pasword.",
          "stausCode": 400,
        },
        "USER_UPDATES_MUST_RETURN_VALUES": {
          "code": "USER_UPDATES_MUST_RETURN_VALUES",
          "message": "User updates must return all attributes of the item.",
          "stausCode": 500,
        },
      }
    `)
	})
})
