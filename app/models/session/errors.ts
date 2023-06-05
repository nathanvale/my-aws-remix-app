import { ServerError, ErrorMessage } from '../../errors'

export type SessionErrorCodes =
	| 'SESSION_ALREADY_EXISTS'
	| 'SESSION_DOES_NOT_EXIST'
	| 'SESSION_NOT_FOUND'
	| 'SESSION_UPDATES_MUST_RETURN_VALUES'

export const SESSION_ERROR_MESSAGES: ErrorMessage<SessionErrorCodes> = {
	SESSION_ALREADY_EXISTS: {
		code: 'SESSION_ALREADY_EXISTS',
		stausCode: 400,
		message: 'There is already an existing product with this productId.',
	},
	SESSION_DOES_NOT_EXIST: {
		code: 'SESSION_DOES_NOT_EXIST',
		stausCode: 400,
		message: 'You cannot delete a product that does not exist.',
	},
	SESSION_NOT_FOUND: {
		code: 'SESSION_NOT_FOUND',
		stausCode: 400,
		message: 'Session not found.',
	},
	SESSION_UPDATES_MUST_RETURN_VALUES: {
		code: 'SESSION_UPDATES_MUST_RETURN_VALUES',
		stausCode: 500,
		message: 'Session updates must return all attributes of the item.',
	},
}

export class SessionError extends ServerError {
	code: SessionErrorCodes
	constructor(code: SessionErrorCodes) {
		const { stausCode, message } = SESSION_ERROR_MESSAGES[code]
		super(code, message, stausCode)
		this.code = code
	}
}
