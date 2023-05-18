export const TEST_USER_EMAIL = 'test@test.com'
export const TEST_USER_ID = '12345'
export const TEST_INVOICE_ID = '12345'
export const TEST_ORDER_ID = '12345'
export const TEST_ORDER_ITEM_ID = '12345'
export const TEST_PRODUCT_ID = '12345'
export const TEST_WAREHOUSE_ITEM_ID = '12345'
export const TEST_WAREHOUSE_ID = '12345'
export const TEST_SHIPMENT_ID = '12345'
export const TEST_SHIPMENT_ITEM_ID = '12345'
export const TEST_NOTE_ID = '12345'

export const clientApiMethodReject = (
	apiMethod: 'query' | 'putItem' | 'getItem' | 'updateItem' | 'deleteItem',
	error: unknown,
) =>
	({
		client: {
			[apiMethod]: () => ({
				promise: () => Promise.reject(error),
			}),
		},
	} as any)

export const clientApiMethodResolve = (
	apiMethod: 'query' | 'putItem' | 'getItem' | 'updateItem' | 'deleteItem',
	response: unknown,
) =>
	({
		client: {
			[apiMethod]: () => ({
				promise: () => Promise.resolve(response),
			}),
		},
	} as any)
