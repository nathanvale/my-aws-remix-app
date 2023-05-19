import { DynamoDB, AWSError } from 'aws-sdk'
import { ulid } from 'ulid'
import { Base, Item } from '../base'
import {
	AWSErrorCodes,
	createItem,
	deleteItem,
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
import { OrderError } from './errors'

export interface Order extends Base {
	readonly orderId: string
	warehouseId: string
	userId: string
}

export class OrderItem extends Item {
	readonly attributes: Order

	constructor(attributes: Order) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: DynamoDB.AttributeMap): OrderItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const order = new OrderItem({
			createdAt: '',
			updatedAt: '',
			orderId: '',
			warehouseId: '',
			userId: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(order.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: Order
		}>(item)

		return new OrderItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		orderId: Order['orderId'],
	): PrimaryKeyAttributeValues {
		const order = new OrderItem({
			createdAt: '',
			updatedAt: '',
			orderId: orderId,
			warehouseId: '',
			userId: '',
		})
		return order.keys()
	}

	get entityType(): string {
		return `order`
	}

	get PK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get SK() {
		return `ORDER#${this.attributes.orderId}`
	}

	get GS1PK(): `WAREHOUSE#${string}` {
		return `WAREHOUSE#${this.attributes.warehouseId}`
	}

	get GS1SK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.createdAt}`
	}

	get GS2PK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get GS2SK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.createdAt}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Order {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			orderId: this.attributes.orderId,
			warehouseId: this.attributes.warehouseId,
			userId: this.attributes.userId,
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

export const createOrder = async (
	order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>,
): Promise<Order> => {
	const orderItem = new OrderItem({
		...order,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		orderId: ulid(),
	})
	await createItem(orderItem.toDynamoDBItem())
	return orderItem.attributes
}

export const readOrder = async (orderId: string): Promise<Order> => {
	const key = OrderItem.getPrimaryKeyAttributeValues(orderId)
	const resp = await readItem(key)
	if (resp.Item) return OrderItem.fromItem(resp.Item).attributes
	else throw new OrderError('ORDER_NOT_FOUND')
}

export const updateOrder = async (order: Order): Promise<Order> => {
	try {
		const key = OrderItem.getPrimaryKeyAttributeValues(order.orderId)
		const orderItem = new OrderItem({
			...order,
			updatedAt: new Date().toISOString(),
		})
		const resp = await updateItem(key, orderItem.toDynamoDBItem().Attributes)
		if (resp?.Attributes) return OrderItem.fromItem(resp.Attributes).attributes
		else throw new OrderError('ORDER_UPDATES_MUST_RETURN_VALUES')
	} catch (error) {
		if (
			(error as AWSError).code ===
			AWSErrorCodes.CONDITIONAL_CHECK_FAILED_EXCEPTION
		)
			throw new OrderError('ORDER_DOES_NOT_EXIST')
		else throw error
	}
}

export const deleteOrder = async (
	orderId: Order['orderId'],
): Promise<Order> => {
	const key = OrderItem.getPrimaryKeyAttributeValues(orderId)
	const resp = await deleteItem(key)
	if (resp.Attributes) return OrderItem.fromItem(resp.Attributes).attributes
	else throw new OrderError('ORDER_DOES_NOT_EXIST')
}
