import { faker } from '@faker-js/faker'
import {
	TEST_ORDER_ID,
	TEST_PRODUCT_ID,
	TEST_SHIPMENT_ID,
	TEST_USER_ID,
	TEST_WAREHOUSE_ID,
} from 'dynamodb/db-test-helpers'
import type { Invoice } from '~/models/invoice/invoice.server'
import type { OrderItem } from '~/models/order-item/order-item.server'
import type { Order } from '~/models/order/order.server'
import type { Product } from '~/models/product/product.server'
import type { ShipmentItem } from '~/models/shipment-item/shipment-item.server'
import type { Shipment } from '~/models/shipment/shipment.server'
import type { User } from '~/models/user/user.server'
import type { WarehouseItem } from '~/models/warehouse-item/warehouse-item.server'
import type { Warehouse } from '~/models/warehouse/warehouse.server'

function getDates() {
	const today = new Date()
	const createdAt = faker.date
		.between(
			new Date().setDate(today.getDate() - 90),
			new Date().setDate(today.getDate() - 60),
		)
		.toISOString()
	const updatedAt = faker.date
		.between(new Date().setDate(today.getDate() - 30), new Date())
		.toISOString()
	return { createdAt, updatedAt }
}

export function createUserSeed(): Omit<User, 'userId'> {
	const { createdAt, updatedAt } = getDates()
	const firstName = faker.helpers.unique(faker.name.firstName)
	const lastName = faker.helpers.unique(faker.name.lastName)

	const username = faker.internet.userName(
		firstName.toLowerCase(),
		lastName.toLowerCase(),
	)

	return {
		email: faker.internet.exampleEmail(
			firstName.toLowerCase(),
			lastName.toLowerCase(),
		),
		name: `${firstName} ${lastName}`,
		username,
		password: faker.internet.password(),
		createdAt,
		updatedAt,
	}
}

export function createProductSeed(): Omit<Product, 'productId'> {
	const { createdAt, updatedAt } = getDates()
	const company = faker.helpers.unique(faker.company.name)
	const price = faker.commerce.price(100, 200)
	const description = faker.commerce.productDescription()
	return { company, price, description, createdAt, updatedAt }
}

export function createWarehouseItemSeed(): Omit<
	WarehouseItem,
	'warehouseItemId'
> {
	const { createdAt, updatedAt } = getDates()
	const productId = TEST_PRODUCT_ID
	const warehouseId = TEST_WAREHOUSE_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { createdAt, productId, quantity, updatedAt, warehouseId }
}

export function createWarehouseSeed(): Omit<Warehouse, 'warehouseId'> {
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const city = faker.address.city()
	return { createdAt, userId, updatedAt, city }
}
export function createInvoiceSeed(): Omit<Invoice, 'invoiceId'> {
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const orderId = TEST_ORDER_ID
	const amount = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { createdAt, userId, updatedAt, amount, orderId }
}

export function createOrderItemSeed(): Omit<OrderItem, 'orderItemId'> {
	const { createdAt, updatedAt } = getDates()
	const productId = TEST_PRODUCT_ID
	const orderId = TEST_ORDER_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { createdAt, updatedAt, productId, quantity, orderId }
}

export function createOrderSeed(): Omit<Order, 'orderId'> {
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const warehouseId = TEST_WAREHOUSE_ID
	return { createdAt, updatedAt, warehouseId, userId }
}

export function createShipmentSeed(): Omit<Shipment, 'shipmentId'> {
	const { createdAt, updatedAt } = getDates()
	const orderId = TEST_ORDER_ID
	const warehouseId = TEST_WAREHOUSE_ID
	const address = faker.address.streetAddress()
	return { createdAt, updatedAt, orderId, warehouseId, address }
}

export function createShipmentItemSeed(): Omit<ShipmentItem, 'shipmentItemId'> {
	const { createdAt, updatedAt } = getDates()
	const orderId = TEST_ORDER_ID
	const shipmentId = TEST_SHIPMENT_ID
	const productId = TEST_PRODUCT_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { createdAt, updatedAt, orderId, quantity, shipmentId, productId }
}
