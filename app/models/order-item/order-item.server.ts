import { ulid } from 'ulid'
import { Base, Item } from '../base'
import {
	AttributeMap,
	createItem,
	deleteItem,
	GSIKeyAttributeValue,
	PrimaryKeyAttributeValues,
	readItem,
	updateItem,
} from 'dynamodb/utils'
import invariant from 'tiny-invariant'
import {
	checkForDBAttributes,
	DynamoDBItem,
	marshall,
	unmarshall,
} from '../../../dynamodb/utils'
import { OrderItemError } from './errors'

export interface OrderItem extends Base {
	readonly orderItemId: string
	readonly orderId: string
	readonly productId: string
	quantity: string
}

export class OrderItemItem extends Item {
	readonly attributes: OrderItem

	constructor(attributes: OrderItem) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: AttributeMap): OrderItemItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const orderItem = new OrderItemItem({
			createdAt: '',
			updatedAt: '',
			productId: '',
			quantity: '',
			orderId: '',
			orderItemId: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(orderItem.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: OrderItem
		}>(item)

		return new OrderItemItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		orderId: OrderItem['orderId'],
		orderItemId: OrderItem['orderItemId'],
	): PrimaryKeyAttributeValues {
		const orderItem = new OrderItemItem({
			orderItemId,
			createdAt: '',
			updatedAt: '',
			quantity: '',
			productId: '',
			orderId,
		})
		return orderItem.keys()
	}

	static getGSIAttributeValues(
		productId: OrderItem['productId'],
		orderId: OrderItem['orderId'],
	): GSIKeyAttributeValue {
		const orderItem = new OrderItemItem({
			createdAt: '',
			updatedAt: '',
			productId,
			quantity: '',
			orderId,
			orderItemId: '',
		})
		return orderItem.gSIKeys()
	}

	get entityType(): string {
		return `orderItem`
	}

	get PK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get SK(): `ORDER_ITEM#${string}` {
		return `ORDER_ITEM#${this.attributes.orderItemId}`
	}

	get GS1PK(): `PRODUCT#${string}` {
		return `PRODUCT#${this.attributes.productId}`
	}

	get GS1SK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get GS2PK() {
		return undefined
	}

	get GS2SK() {
		return undefined
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): OrderItem {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			quantity: this.attributes.quantity,
			orderId: this.attributes.orderId,
			orderItemId: this.attributes.orderItemId,
			productId: this.attributes.productId,
		}
	}

	toDynamoDBItem(): DynamoDBItem {
		return {
			...this.keys(),
			...this.gSIKeys(),
			EntityType: { S: this.entityType },
			Attributes: {
				M: marshall(this.attributes),
			},
		}
	}
}

export const createOrderItem = async (
	orderItem: Omit<OrderItem, 'orderItemId' | 'createdAt' | 'updatedAt'>,
): Promise<OrderItem> => {
	const orderItemItem = new OrderItemItem({
		...orderItem,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		orderItemId: ulid(),
	})
	await createItem(orderItemItem.toDynamoDBItem())
	return orderItemItem.attributes
}

export const readOrderItem = async (
	orderItemId: string,
	productId: string,
): Promise<OrderItem> => {
	const key = OrderItemItem.getPrimaryKeyAttributeValues(orderItemId, productId)
	const resp = await readItem(key)
	if (resp.Item) return OrderItemItem.fromItem(resp.Item).attributes
	else throw new OrderItemError('ORDER_ITEM_NOT_FOUND')
}

export const updateOrderItem = async (
	orderItem: OrderItem,
): Promise<OrderItem> => {
	const key = OrderItemItem.getPrimaryKeyAttributeValues(
		orderItem.orderId,
		orderItem.orderItemId,
	)
	const orderItemItem = new OrderItemItem({
		...orderItem,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, orderItemItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes)
		return OrderItemItem.fromItem(resp.Attributes).attributes
	else throw new OrderItemError('ORDER_ITEM_UPDATES_MUST_RETURN_VALUES')
}

export const deleteOrderItem = async (
	orderId: OrderItem['orderId'],
	orderItemId: OrderItem['orderItemId'],
): Promise<OrderItem> => {
	const key = OrderItemItem.getPrimaryKeyAttributeValues(orderId, orderItemId)
	const resp = await deleteItem(key)
	if (resp.Attributes) return OrderItemItem.fromItem(resp.Attributes).attributes
	else throw new OrderItemError('ORDER_ITEM_DOES_NOT_EXIST')
}
