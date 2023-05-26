import { ServerError, ErrorMessage } from '../../errors.ts'

export type ProductErrorCodes =
	| 'PRODUCT_ALREADY_EXISTS'
	| 'PRODUCT_DOES_NOT_EXIST'
	| 'PRODUCT_NOT_FOUND'
	| 'PRODUCT_UPDATES_MUST_RETURN_VALUES'

export const PRODUCT_ERROR_MESSAGES: ErrorMessage<ProductErrorCodes> = {
	PRODUCT_ALREADY_EXISTS: {
		code: 'PRODUCT_ALREADY_EXISTS',
		stausCode: 400,
		message: 'There is already an existing product with this productId.',
	},
	PRODUCT_DOES_NOT_EXIST: {
		code: 'PRODUCT_DOES_NOT_EXIST',
		stausCode: 400,
		message: 'You cannot delete a product that does not exist.',
	},
	PRODUCT_NOT_FOUND: {
		code: 'PRODUCT_NOT_FOUND',
		stausCode: 400,
		message: 'Product not found.',
	},
	PRODUCT_UPDATES_MUST_RETURN_VALUES: {
		code: 'PRODUCT_UPDATES_MUST_RETURN_VALUES',
		stausCode: 500,
		message: 'Product updates must return all attributes of the item.',
	},
}

export class ProductError extends ServerError {
	code: ProductErrorCodes
	constructor(code: ProductErrorCodes) {
		const { stausCode, message } = PRODUCT_ERROR_MESSAGES[code]
		super(code, message, stausCode)
		this.code = code
	}
}
