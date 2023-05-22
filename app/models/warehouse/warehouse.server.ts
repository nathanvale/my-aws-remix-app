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
import { WarehouseError } from './errors'

export interface Warehouse extends Base {
	readonly warehouseId: string
	userId: string
	city: string
}

export class WarehouseItem extends Item {
	readonly attributes: Warehouse

	constructor(attributes: Warehouse) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: AttributeMap): WarehouseItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const warehouse = new WarehouseItem({
			warehouseId: '',
			userId: '',
			city: '',
			createdAt: '',
			updatedAt: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(warehouse.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: Warehouse
		}>(item)

		return new WarehouseItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		warehouseId: Warehouse['warehouseId'],
	): PrimaryKeyAttributeValues {
		const warehouse = new WarehouseItem({
			warehouseId: warehouseId,
			userId: '',
			city: '',
			createdAt: '',
			updatedAt: '',
		})
		return warehouse.keys()
	}

	static getGSIAttributeValues(
		userId: Warehouse['userId'],
		warehouseId: Warehouse['warehouseId'],
	): GSIKeyAttributeValue {
		const user = new WarehouseItem({
			createdAt: '',
			updatedAt: '',
			city: '',
			warehouseId,
			userId,
		})
		return user.gSIKeys()
	}

	get entityType(): string {
		return `warehouse`
	}

	get PK(): `WAREHOUSE#${string}` {
		return `WAREHOUSE#${this.attributes.warehouseId}`
	}

	get SK() {
		return `WAREHOUSE#${this.attributes.warehouseId}`
	}

	get GS1PK() {
		return undefined
	}

	get GS1SK() {
		return undefined
	}

	get GS2PK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get GS2SK(): `WAREHOUSE#${string}` {
		return `WAREHOUSE#${this.attributes.warehouseId}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Warehouse {
		return {
			city: this.attributes.city,
			userId: this.attributes.userId,
			warehouseId: this.attributes.warehouseId,
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
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

export const createWarehouse = async (
	warehouse: Omit<Warehouse, 'warehouseId' | 'createdAt' | 'updatedAt'>,
): Promise<Warehouse> => {
	const warehouseItem = new WarehouseItem({
		...warehouse,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		warehouseId: ulid(),
	})
	await createItem(warehouseItem.toDynamoDBItem())
	return warehouseItem.attributes
}

export const readWarehouse = async (
	warehouseId: string,
): Promise<Warehouse> => {
	const key = WarehouseItem.getPrimaryKeyAttributeValues(warehouseId)
	const resp = await readItem(key)
	if (resp.Item) return WarehouseItem.fromItem(resp.Item).attributes
	else throw new WarehouseError('WAREHOUSE_NOT_FOUND')
}

export const updateWarehouse = async (
	warehouse: Warehouse,
): Promise<Warehouse> => {
	const key = WarehouseItem.getPrimaryKeyAttributeValues(warehouse.warehouseId)
	const warehouseItem = new WarehouseItem({
		...warehouse,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, warehouseItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes)
		return WarehouseItem.fromItem(resp.Attributes).attributes
	else throw new WarehouseError('WAREHOUSE_UPDATES_MUST_RETURN_VALUES')
}

export const deleteWarehouse = async (
	warehouseId: Warehouse['warehouseId'],
): Promise<Warehouse> => {
	const key = WarehouseItem.getPrimaryKeyAttributeValues(warehouseId)
	const resp = await deleteItem(key)
	if (resp.Attributes) return WarehouseItem.fromItem(resp.Attributes).attributes
	else throw new WarehouseError('WAREHOUSE_DOES_NOT_EXIST')
}
