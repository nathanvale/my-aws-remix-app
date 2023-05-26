import { ulid } from 'ulid'
import { Base, Item } from '../base.ts'
import {
	AttributeMap,
	createItem,
	deleteItem,
	GSIKeyAttributeValue,
	PrimaryKeyAttributeValues,
	readItem,
	updateItem,
} from 'dynamodb/utils.ts'
import invariant from 'tiny-invariant'
import {
	checkForDBAttributes,
	DynamoDBItem,
	marshall,
	unmarshall,
} from '../../../dynamodb/utils.ts'
import { ShipmentError } from './errors.ts'

export interface Shipment extends Base {
	readonly shipmentId: string
	readonly orderId: string
	readonly warehouseId: string
	address: string
}

export class ShipmentItem extends Item {
	readonly attributes: Shipment

	constructor(attributes: Shipment) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: AttributeMap): ShipmentItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const shipment = new ShipmentItem({
			shipmentId: '',
			orderId: '',
			createdAt: '',
			updatedAt: '',
			address: '',
			warehouseId: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(shipment.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: Shipment
		}>(item)

		return new ShipmentItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		shipmentId: Shipment['shipmentId'],
		orderId: Shipment['orderId'],
	): PrimaryKeyAttributeValues {
		const shipment = new ShipmentItem({
			createdAt: '',
			shipmentId,
			orderId,
			updatedAt: '',
			address: '',
			warehouseId: '',
		})
		return shipment.keys()
	}

	static getGSIAttributeValues(
		createdAt: Shipment['createdAt'],
		warehouseId: Shipment['warehouseId'],
		shipmentId: Shipment['shipmentId'],
	): GSIKeyAttributeValue {
		const user = new ShipmentItem({
			orderId: '',
			createdAt,
			updatedAt: '',
			address: '',
			warehouseId,
			shipmentId,
		})
		return user.gSIKeys()
	}

	get entityType(): string {
		return `shipment`
	}

	get PK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get SK(): `SHIPMENT#${string}` {
		return `SHIPMENT#${this.attributes.shipmentId}`
	}

	get GS1PK(): `WAREHOUSE#${string}` {
		return `WAREHOUSE#${this.attributes.warehouseId}`
	}

	get GS1SK(): `SHIPMENT#${string}` {
		return `SHIPMENT#${this.attributes.createdAt}`
	}

	get GS2PK(): `SHIPMENT#${string}` {
		return `SHIPMENT#${this.attributes.shipmentId}`
	}

	get GS2SK(): `SHIPMENT#${string}` {
		return `SHIPMENT#${this.attributes.shipmentId}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Shipment {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			shipmentId: this.attributes.shipmentId,
			orderId: this.attributes.orderId,
			address: this.attributes.address,
			warehouseId: this.attributes.warehouseId,
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

export const createShipment = async (
	shipment: Omit<Shipment, 'shipmentId' | 'createdAt' | 'updatedAt'>,
): Promise<Shipment> => {
	const shipmentItem = new ShipmentItem({
		...shipment,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		shipmentId: ulid(),
	})
	await createItem(shipmentItem.toDynamoDBItem())
	return shipmentItem.attributes
}

export const readShipment = async (
	shipmentId: string,
	productId: string,
): Promise<Shipment> => {
	const key = ShipmentItem.getPrimaryKeyAttributeValues(shipmentId, productId)
	const resp = await readItem(key)
	if (resp.Item) return ShipmentItem.fromItem(resp.Item).attributes
	else throw new ShipmentError('SHIPMENT_NOT_FOUND')
}

export const updateShipment = async (shipment: Shipment): Promise<Shipment> => {
	const key = ShipmentItem.getPrimaryKeyAttributeValues(
		shipment.shipmentId,
		shipment.orderId,
	)
	const shipmentItem = new ShipmentItem({
		...shipment,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, shipmentItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes) return ShipmentItem.fromItem(resp.Attributes).attributes
	else throw new ShipmentError('SHIPMENT_UPDATES_MUST_RETURN_VALUES')
}

export const deleteShipment = async (
	shipmentId: Shipment['shipmentId'],
	orderId: Shipment['orderId'],
): Promise<Shipment> => {
	const key = ShipmentItem.getPrimaryKeyAttributeValues(shipmentId, orderId)
	const resp = await deleteItem(key)
	if (resp.Attributes) return ShipmentItem.fromItem(resp.Attributes).attributes
	else throw new ShipmentError('SHIPMENT_DOES_NOT_EXIST')
}
