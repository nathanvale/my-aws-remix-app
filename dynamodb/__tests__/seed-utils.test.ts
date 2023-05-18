import { marshall } from 'dynamodb/utils'
import {
	createInvoiceSeed,
	createOrderItemSeed,
	createOrderSeed,
	createProductSeed,
	createShipmentSeed,
	createUserSeed,
	createWarehouseItemSeed,
	createWarehouseSeed,
} from '../seed-utils'

test('should output user seed', async () => {
	const result = createUserSeed()
	JSON.stringify(marshall(result)) //?
})
test('should output product seed', async () => {
	const result = createProductSeed()
	JSON.stringify(marshall(result)) //?
})

test('should output warehouseItem seed', async () => {
	const result = createWarehouseItemSeed()
	JSON.stringify(marshall(result)) //?
})
test('should output warehouse seed', async () => {
	const result = createWarehouseSeed()
	JSON.stringify(marshall(result)) //?
})
test('should output invoice seed', async () => {
	const result = createInvoiceSeed()
	JSON.stringify(marshall(result)) //?
})

test('should output order item seed', async () => {
	const result = createOrderItemSeed()
	JSON.stringify(marshall(result)) //?
})

test('should output order seed', async () => {
	const result = createOrderSeed()
	JSON.stringify(marshall(result)) //?
})

test('should output shipment seed', async () => {
	const result = createShipmentSeed()
	JSON.stringify(marshall(result)) //?
})
