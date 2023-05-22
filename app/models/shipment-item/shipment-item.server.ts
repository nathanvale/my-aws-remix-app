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
import { ShipmentItemError } from './errors'

export interface ShipmentItem extends Base {
	readonly orderId: string
	readonly shipmentItemId: string
	quantity: string
	readonly shipmentId: string
	readonly productId: string
}

export class ShipmentItemItem extends Item {
	readonly attributes: ShipmentItem

	constructor(attributes: ShipmentItem) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: AttributeMap): ShipmentItemItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const shipmentItem = new ShipmentItemItem({
			shipmentItemId: '',
			orderId: '',
			createdAt: '',
			updatedAt: '',
			quantity: '3',
			productId: '',
			shipmentId: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(shipmentItem.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: ShipmentItem
		}>(item)

		return new ShipmentItemItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		shipmentItemId: ShipmentItem['shipmentItemId'],
		orderId: ShipmentItem['orderId'],
	): PrimaryKeyAttributeValues {
		const shipmentItem = new ShipmentItemItem({
			createdAt: '',
			shipmentItemId,
			orderId,
			updatedAt: '',
			quantity: '3',
			productId: '',
			shipmentId: '',
		})
		return shipmentItem.keys()
	}

	static getGSIAttributeValues(
		shipmentId: ShipmentItem['shipmentId'],
		productId: ShipmentItem['productId'],
	): GSIKeyAttributeValue {
		const user = new ShipmentItemItem({
			orderId: '',
			createdAt: '',
			updatedAt: '',
			shipmentItemId: '',
			shipmentId,
			quantity: '3',
			productId,
		})
		return user.gSIKeys()
	}

	get entityType(): string {
		return `shipmentItem`
	}

	get PK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get SK(): `SHIPMENT_ITEM#${string}` {
		return `SHIPMENT_ITEM#${this.attributes.shipmentItemId}`
	}

	get GS1PK() {
		return undefined
	}

	get GS1SK() {
		return undefined
	}

	get GS2PK(): `SHIPMENT#${string}` {
		return `SHIPMENT#${this.attributes.shipmentId}`
	}

	get GS2SK(): `PRODUCT#${string}` {
		return `PRODUCT#${this.attributes.productId}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): ShipmentItem {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			shipmentItemId: this.attributes.shipmentItemId,
			orderId: this.attributes.orderId,
			quantity: this.attributes.quantity,
			productId: this.attributes.productId,
			shipmentId: this.attributes.shipmentId,
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

export const createShipmentItem = async (
	shipment: Omit<ShipmentItem, 'shipmentItemId' | 'createdAt' | 'updatedAt'>,
): Promise<ShipmentItem> => {
	const shipmentItem = new ShipmentItemItem({
		...shipment,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		shipmentItemId: ulid(),
	})
	await createItem(shipmentItem.toDynamoDBItem())
	return shipmentItem.attributes
}

export const readShipmentItem = async (
	shipmentItemId: string,
	productId: string,
): Promise<ShipmentItem> => {
	const key = ShipmentItemItem.getPrimaryKeyAttributeValues(
		shipmentItemId,
		productId,
	)
	const resp = await readItem(key)
	if (resp.Item) return ShipmentItemItem.fromItem(resp.Item).attributes
	else throw new ShipmentItemError('SHIPMENT_ITEM_NOT_FOUND')
}

export const updateShipmentItem = async (
	shipment: ShipmentItem,
): Promise<ShipmentItem> => {
	const key = ShipmentItemItem.getPrimaryKeyAttributeValues(
		shipment.shipmentItemId,
		shipment.orderId,
	)
	const shipmentItem = new ShipmentItemItem({
		...shipment,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, shipmentItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes)
		return ShipmentItemItem.fromItem(resp.Attributes).attributes
	else throw new ShipmentItemError('SHIPMENT_ITEM_UPDATES_MUST_RETURN_VALUES')
}

export const deleteShipmentItem = async (
	shipmentItemId: ShipmentItem['shipmentItemId'],
	orderId: ShipmentItem['orderId'],
): Promise<ShipmentItem> => {
	const key = ShipmentItemItem.getPrimaryKeyAttributeValues(
		shipmentItemId,
		orderId,
	)
	const resp = await deleteItem(key)
	if (resp.Attributes)
		return ShipmentItemItem.fromItem(resp.Attributes).attributes
	else throw new ShipmentItemError('SHIPMENT_ITEM_DOES_NOT_EXIST')
}
