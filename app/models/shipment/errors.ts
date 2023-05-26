import { ServerError, ErrorMessage } from '../../errors.ts'

export type ShipmentErrorCodes =
	| 'SHIPMENT_ALREADY_EXISTS'
	| 'SHIPMENT_DOES_NOT_EXIST'
	| 'SHIPMENT_NOT_FOUND'
	| 'SHIPMENT_UPDATES_MUST_RETURN_VALUES'

export const SHIPMENT_ERROR_MESSAGES: ErrorMessage<ShipmentErrorCodes> = {
	SHIPMENT_ALREADY_EXISTS: {
		code: 'SHIPMENT_ALREADY_EXISTS',
		stausCode: 400,
		message: 'There is already an existing shipment with this shipmentId.',
	},
	SHIPMENT_DOES_NOT_EXIST: {
		code: 'SHIPMENT_DOES_NOT_EXIST',
		stausCode: 400,
		message: 'You cannot delete a shipment that does not exist.',
	},
	SHIPMENT_NOT_FOUND: {
		code: 'SHIPMENT_NOT_FOUND',
		stausCode: 400,
		message: 'Shipment item not found.',
	},
	SHIPMENT_UPDATES_MUST_RETURN_VALUES: {
		code: 'SHIPMENT_UPDATES_MUST_RETURN_VALUES',
		stausCode: 500,
		message: 'Shipment item updates must return all attributes of the item.',
	},
}

export class ShipmentError extends ServerError {
	code: ShipmentErrorCodes
	constructor(code: ShipmentErrorCodes) {
		const { stausCode, message } = SHIPMENT_ERROR_MESSAGES[code]
		super(code, message, stausCode)
		this.code = code
	}
}
