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

export function createUserSeed(): User {
	const { createdAt, updatedAt } = getDates()
	const firstName = faker.helpers.unique(faker.name.firstName)
	const lastName = faker.helpers.unique(faker.name.lastName)
	const image = faker.image.avatar()

	const username = faker.internet.userName(
		firstName.toLowerCase(),
		lastName.toLowerCase(),
	)

	return {
		userId: faker.helpers.unique(faker.random.alphaNumeric),
		email: faker.internet.exampleEmail(
			firstName.toLowerCase(),
			lastName.toLowerCase(),
		),
		name: `${firstName} ${lastName}`,
		username,
		password: faker.internet.password(),
		createdAt,
		updatedAt,
		image,
	}
}

export function createProductSeed(): Product {
	const productId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const company = faker.helpers.unique(faker.company.name)
	const price = faker.commerce.price(100, 200)
	const description = faker.commerce.productDescription()
	return { productId, company, price, description, createdAt, updatedAt }
}

export function createWarehouseItemSeed(): WarehouseItem {
	const warehouseItemId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const productId = TEST_PRODUCT_ID
	const warehouseId = TEST_WAREHOUSE_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return {
		warehouseItemId,
		createdAt,
		productId,
		quantity,
		updatedAt,
		warehouseId,
	}
}

export function createWarehouseSeed(): Warehouse {
	const warehouseId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const city = faker.address.city()
	return { warehouseId, createdAt, userId, updatedAt, city }
}
export function createInvoiceSeed(): Invoice {
	const invoiceId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const orderId = TEST_ORDER_ID
	const amount = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { invoiceId, createdAt, userId, updatedAt, amount, orderId }
}

export function createOrderItemSeed(): OrderItem {
	const orderItemId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const productId = TEST_PRODUCT_ID
	const orderId = TEST_ORDER_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return { orderItemId, createdAt, updatedAt, productId, quantity, orderId }
}

export function createOrderSeed(): Order {
	const orderId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const userId = TEST_USER_ID
	const warehouseId = TEST_WAREHOUSE_ID
	return { orderId, createdAt, updatedAt, warehouseId, userId }
}

export function createShipmentSeed(): Shipment {
	const shipmentId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const orderId = TEST_ORDER_ID
	const warehouseId = TEST_WAREHOUSE_ID
	const address = faker.address.streetAddress()
	return { shipmentId, createdAt, updatedAt, orderId, warehouseId, address }
}

export function createShipmentItemSeed(): ShipmentItem {
	const shipmentItemId = faker.helpers.unique(faker.random.alphaNumeric)
	const { createdAt, updatedAt } = getDates()
	const orderId = TEST_ORDER_ID
	const shipmentId = TEST_SHIPMENT_ID
	const productId = TEST_PRODUCT_ID
	const quantity = faker.datatype.number({ min: 1, max: 100 }).toString()
	return {
		shipmentItemId,
		createdAt,
		updatedAt,
		orderId,
		quantity,
		shipmentId,
		productId,
	}
}
