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
import { InvoiceError } from './errors.ts'

export interface Invoice extends Base {
	readonly invoiceId: string
	readonly userId: string
	readonly orderId: string
	amount: string
}

export class InvoiceItem extends Item {
	readonly attributes: Invoice

	constructor(attributes: Invoice) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item?: AttributeMap): InvoiceItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')
		const invoice = new InvoiceItem({
			invoiceId: '',
			orderId: '',
			createdAt: '',
			updatedAt: '',
			userId: '',
			amount: '',
		})
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(invoice.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: Invoice
		}>(item)

		return new InvoiceItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		invoiceId: Invoice['invoiceId'],
		orderId: Invoice['orderId'],
	): PrimaryKeyAttributeValues {
		const invoice = new InvoiceItem({
			amount: '',
			createdAt: '',
			invoiceId,
			orderId,
			updatedAt: '',
			userId: '',
		})
		return invoice.keys()
	}

	static getGSIAttributeValues(
		createdAt: Invoice['createdAt'],
		invoiceId: Invoice['invoiceId'],
		userId: Invoice['userId'],
	): GSIKeyAttributeValue {
		const user = new InvoiceItem({
			orderId: '',
			createdAt,
			updatedAt: '',
			amount: '',
			userId,
			invoiceId,
		})
		return user.gSIKeys()
	}

	get entityType(): string {
		return `invoice`
	}

	get PK(): `ORDER#${string}` {
		return `ORDER#${this.attributes.orderId}`
	}

	get SK(): `INVOICE#${string}` {
		return `INVOICE#${this.attributes.invoiceId}`
	}

	get GS1PK(): `INVOICE#${string}` {
		return `INVOICE#${this.attributes.invoiceId}`
	}

	get GS1SK(): `INVOICE#${string}` {
		return `INVOICE#${this.attributes.invoiceId}`
	}

	get GS2PK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get GS2SK(): `INVOICE#${string}` {
		return `INVOICE#${this.attributes.createdAt}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Invoice {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			invoiceId: this.attributes.invoiceId,
			orderId: this.attributes.orderId,
			userId: this.attributes.userId,
			amount: this.attributes.amount,
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

export const createInvoice = async (
	invoice: Omit<Invoice, 'invoiceId' | 'createdAt' | 'updatedAt'>,
): Promise<Invoice> => {
	const invoiceItem = new InvoiceItem({
		...invoice,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		invoiceId: ulid(),
	})
	await createItem(invoiceItem.toDynamoDBItem())
	return invoiceItem.attributes
}

export const readInvoice = async (
	invoiceId: string,
	productId: string,
): Promise<Invoice> => {
	const key = InvoiceItem.getPrimaryKeyAttributeValues(invoiceId, productId)
	const resp = await readItem(key)
	if (resp.Item) return InvoiceItem.fromItem(resp.Item).attributes
	else throw new InvoiceError('INVOICE_NOT_FOUND')
}

export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
	const key = InvoiceItem.getPrimaryKeyAttributeValues(
		invoice.invoiceId,
		invoice.orderId,
	)
	const invoiceItem = new InvoiceItem({
		...invoice,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, invoiceItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes) return InvoiceItem.fromItem(resp.Attributes).attributes
	else throw new InvoiceError('INVOICE_UPDATES_MUST_RETURN_VALUES')
}

export const deleteInvoice = async (
	invoiceId: Invoice['invoiceId'],
	orderId: Invoice['orderId'],
): Promise<Invoice> => {
	const key = InvoiceItem.getPrimaryKeyAttributeValues(invoiceId, orderId)
	const resp = await deleteItem(key)
	if (resp.Attributes) return InvoiceItem.fromItem(resp.Attributes).attributes
	else throw new InvoiceError('INVOICE_DOES_NOT_EXIST')
}
