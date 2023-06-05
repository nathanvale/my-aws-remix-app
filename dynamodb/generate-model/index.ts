import fs from 'fs'
import { UserItem } from '~/models/user/user.server'
import type { TableData } from './types'
import { getEmptyDataModel } from './utils'

import {
	TEST_ORDER_ID,
	TEST_ORDER_ITEM_ID,
	TEST_PRODUCT_ID,
	TEST_SHIPMENT_ITEM_ID,
	TEST_USER_ID,
	TEST_WAREHOUSE_ID,
	TEST_WAREHOUSE_ITEM_ID,
	TEST_INVOICE_ID,
	TEST_NOTE_ID,
	TEST_SHIPMENT_ID,
	TEST_SESSION_ID,
} from 'dynamodb/db-test-helpers'

import { ProductItem } from '~/models/product/product.server'
import { WarehouseItem } from '~/models/warehouse/warehouse.server'
import { WarehouseItemItem } from '~/models/warehouse-item/warehouse-item.server'
import { OrderItem } from '~/models/order/order.server'
import { OrderItemItem } from '~/models/order-item/order-item.server'
import { InvoiceItem } from '~/models/invoice/invoice.server'
import { ShipmentItem } from '~/models/shipment/shipment.server'
import { ShipmentItemItem } from '~/models/shipment-item/shipment-item.server'
import { NoteItem } from '~/models/note/note.server'
import { SessionItem } from '~/models/session/session.server'

export async function main() {
	const testUser = new UserItem({
		createdAt: '2022-08-31T05:46:41.205Z',
		updatedAt: '2022-11-25T13:45:46.999Z',
		userId: TEST_USER_ID,
		email: 'test@test.com',
		password: '$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq',
		name: 'Test User',
		username: 'test_user',
		image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
	})

	const testSession = new SessionItem({
		createdAt: '2022-08-31T05:46:41.205Z',
		updatedAt: '2022-11-25T13:45:46.999Z',
		expirationDate: '2022-11-25T13:45:46.999Z',
		sessionId: TEST_SESSION_ID,
		userId: TEST_USER_ID,
	})

	const testSession2 = new SessionItem({
		createdAt: '2022-08-30T05:46:41.205Z',
		updatedAt: '2022-11-25T13:45:46.999Z',
		expirationDate: '2022-11-25T13:45:46.999Z',
		sessionId: '54321',
		userId: '54321',
	})
	const testProduct = new ProductItem({
		company: 'Mann - Thiel',
		createdAt: '2022-08-31T05:46:41.205Z',
		description:
			'Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals',
		price: '143.00',
		productId: TEST_PRODUCT_ID,
		updatedAt: '2022-11-25T13:45:46.999Z',
	})

	const testWarehouse = new WarehouseItem({
		city: 'Fort Ellaboro',
		createdAt: '2022-08-31T05:46:41.205Z',
		updatedAt: '2022-11-25T13:45:46.999Z',
		userId: TEST_USER_ID,
		warehouseId: TEST_WAREHOUSE_ID,
	})

	const testWarehouseItem = new WarehouseItemItem({
		createdAt: '2020-06-21',
		productId: TEST_PRODUCT_ID,
		quantity: '50',
		updatedAt: '2020-06-21',
		warehouseId: TEST_WAREHOUSE_ID,
		warehouseItemId: TEST_WAREHOUSE_ITEM_ID,
	})

	const testOrder = new OrderItem({
		createdAt: '2022-08-31T05:46:41.205Z',
		orderId: '12345',
		updatedAt: '2022-11-25T13:45:46.999Z',
		userId: '12345',
		warehouseId: '12345',
	})

	const testOrderItem = new OrderItemItem({
		createdAt: '2021-01-01T00:00:00.000Z',
		orderId: TEST_ORDER_ID,
		orderItemId: TEST_ORDER_ITEM_ID,
		productId: TEST_PRODUCT_ID,
		quantity: '1',
		updatedAt: '2021-01-01T00:00:00.000Z',
	})

	const testInvoice = new InvoiceItem({
		amount: '23',
		createdAt: '2022-09-29T07:11:20.245Z',
		invoiceId: TEST_INVOICE_ID,
		orderId: TEST_ORDER_ID,
		updatedAt: '2022-11-07T19:23:28.342Z',
		userId: TEST_USER_ID,
	})

	const testShipping = new ShipmentItem({
		address: '596 Kuhlman Extensions',
		createdAt: '2022-10-02T05:54:06.069Z',
		orderId: TEST_ORDER_ID,
		shipmentId: TEST_SHIPMENT_ID,
		updatedAt: '2022-12-03T01:24:47.781Z',
		warehouseId: TEST_WAREHOUSE_ID,
	})

	const testShippingItem = new ShipmentItemItem({
		createdAt: '2020-06-21',
		orderId: TEST_ORDER_ID,
		productId: TEST_PRODUCT_ID,
		quantity: '50',
		shipmentId: TEST_SHIPMENT_ID,
		shipmentItemId: TEST_SHIPMENT_ITEM_ID,
		updatedAt: '2020-06-21',
	})

	const testNote = new NoteItem({
		body: 'Body',
		noteId: TEST_NOTE_ID,
		title: 'Title',
		userId: TEST_USER_ID,
	})

	const tableData: TableData = [
		testSession.toDynamoDBItem(),
		testSession2.toDynamoDBItem(),
		testUser.toDynamoDBItem(),
		testProduct.toDynamoDBItem(),
		testWarehouse.toDynamoDBItem(),
		testWarehouseItem.toDynamoDBItem(),
		testOrder.toDynamoDBItem(),
		testOrderItem.toDynamoDBItem(),
		testInvoice.toDynamoDBItem(),
		testShipping.toDynamoDBItem(),
		testShippingItem.toDynamoDBItem(),
		testNote.toDynamoDBItem(),
	]

	const dataModel = getEmptyDataModel(tableData)

	const json = JSON.stringify(dataModel, null, 2)
	const outputPath = process.cwd() + '/data-model.json'

	fs.writeFile('data-model.json', json, 'utf8', err => {
		if (err) {
			console.error('Error writing JSON file:', err)
		} else {
			console.log(`JSON file has been created successfully oa ${outputPath}!`)
		}
	})
}

if (require.main === module) {
	main()
}
