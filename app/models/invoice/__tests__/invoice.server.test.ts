/* eslint-disable jest/no-disabled-tests */
import {
	createInvoice,
	deleteInvoice,
	readInvoice,
	updateInvoice,
	InvoiceItem,
} from '../invoice.server.ts'
import ulid from 'ulid'
import { InvoiceError } from '../errors.ts'
import {
	clientApiMethodReject,
	clientApiMethodResolve,
	TEST_INVOICE_ID,
	TEST_ORDER_ID,
	TEST_PRODUCT_ID,
	TEST_USER_ID,
} from 'dynamodb/db-test-helpers.ts'
import * as client from '../../../../dynamodb/client.ts'
import * as log from '../../log.ts'

import { createInvoiceSeed } from 'dynamodb/seed-utils.ts'

const createdNow = new Date('2022-12-01T00:00:00.000Z')
const updatedNow = new Date('2022-12-05T00:00:00.000Z')

beforeEach(() => {
	vi.restoreAllMocks()
	vi.spyOn(log, 'logError').mockReturnValue('id')
	vi.useFakeTimers()
	vi.setSystemTime(createdNow)
})
describe.skip('Skip for now...', () => {
	describe('InvoiceItem', () => {
		test('should get a DynamoDB attribute map of a warehouse item', async () => {
			const invoiceItem = new InvoiceItem({
				orderId: TEST_ORDER_ID,
				createdAt: '2021-01-01T00:00:00.000Z',
				amount: '1',
				updatedAt: '2021-01-01T00:00:00.000Z',
				userId: TEST_USER_ID,
				invoiceId: TEST_INVOICE_ID,
			}).toDynamoDBItem()

			expect(invoiceItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "amount": {
              "S": "1",
            },
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "invoiceId": {
              "S": "12345",
            },
            "orderId": {
              "S": "12345",
            },
            "updatedAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "userId": {
              "S": "12345",
            },
          },
        },
        "EntityType": {
          "S": "invoice",
        },
        "GS1PK": {
          "S": "INVOICE#12345",
        },
        "GS1SK": {
          "S": "INVOICE#12345",
        },
        "GS2PK": {
          "S": "USER#12345",
        },
        "GS2SK": {
          "S": "INVOICE#2021-01-01T00:00:00.000Z",
        },
        "PK": {
          "S": "ORDER#12345",
        },
        "SK": {
          "S": "INVOICE#12345",
        },
      }
    `)
		})

		test('should get GSI attribute values', () => {
			const result = InvoiceItem.getGSIAttributeValues(
				'2021-01-01T00:00:00.000Z',
				'invoiceId',
				'userId',
			)
			expect(result).toMatchInlineSnapshot(`
      {
        "GS1PK": {
          "S": "INVOICE#invoiceId",
        },
        "GS1SK": {
          "S": "INVOICE#invoiceId",
        },
        "GS2PK": {
          "S": "USER#userId",
        },
        "GS2SK": {
          "S": "INVOICE#2021-01-01T00:00:00.000Z",
        },
      }
    `)
		})
	})

	describe('createInvoice', () => {
		test('should create a warehouse item', async () => {
			const invoiceId = 'newInvoiceId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(invoiceId)
			const userMock = new InvoiceItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				userId: TEST_USER_ID,
				invoiceId,
				orderId: TEST_ORDER_ID,
				amount: '1',
			}).toItem()
			const createdUser = await createInvoice(userMock)
			await deleteInvoice(invoiceId, TEST_ORDER_ID)
			expect(createdUser).toMatchInlineSnapshot(`
      {
        "amount": "1",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "invoiceId": "newInvoiceId",
        "orderId": "12345",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
      }
    `)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('putItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				createInvoice(createInvoiceSeed()),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('readInvoice', () => {
		test('should read a warehouse item', async () => {
			const result = await readInvoice(TEST_INVOICE_ID, TEST_PRODUCT_ID)
			expect(result).toMatchInlineSnapshot(`
      {
        "amount": "23",
        "createdAt": "2022-09-29T07:11:20.245Z",
        "invoiceId": "12345",
        "orderId": "12345",
        "updatedAt": "2022-11-07T19:23:28.342Z",
        "userId": "12345",
      }
    `)
		})

		test('should return an error when getting a warehouse item that does not exist', async () => {
			const result = await getError(async () =>
				readInvoice('unknownInvoiceId', TEST_PRODUCT_ID),
			)
			expect(result).toMatchInlineSnapshot('[Error: Invoice item not found.]')
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('getItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				readInvoice(TEST_INVOICE_ID, TEST_PRODUCT_ID),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('updateInvoice', () => {
		test('should update a invoice item', async () => {
			const invoiceId = 'updateInvoiceId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(invoiceId)
			const userMock = new InvoiceItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				amount: '1',
				userId: TEST_USER_ID,
				invoiceId,
				orderId: TEST_ORDER_ID,
			}).toItem()
			const createdInvoice = await createInvoice(userMock)
			const amount = 'updatedAmount'
			vi.setSystemTime(updatedNow)
			const updatedInvoice = await updateInvoice({
				...createdInvoice,
				amount,
			})
			await deleteInvoice(invoiceId, TEST_PRODUCT_ID)
			expect(updatedInvoice).toMatchInlineSnapshot(`
      {
        "amount": "updatedAmount",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "invoiceId": "updateInvoiceId",
        "orderId": "12345",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "userId": "12345",
      }
    `)
		})

		test('should throw an error is a warehouse item does not exist', async () => {
			const result = await getError(async () =>
				updateInvoice({
					...createInvoiceSeed(),
					invoiceId: 'unknownInvoiceId',
				}),
			)
			expect(result).toMatchInlineSnapshot(
				'[Error: You cannot delete a invoice that does not exist.]',
			)
		})
		test('should throw an when an item update doesnt return values', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodResolve('updateItem', {}),
			)
			const error = await getError<InvoiceError>(async () =>
				updateInvoice({
					...createInvoiceSeed(),
					invoiceId: '',
				}),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: Invoice item updates must return all attributes of the item.]',
			)
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('updateItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				updateInvoice({
					...createInvoiceSeed(),
					invoiceId: '',
				}),
			)

			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('deleteInvoice', () => {
		test('should delete a warehouse item', async () => {
			const invoiceId = 'deleteInvoiceId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(invoiceId)
			const userMock = new InvoiceItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				amount: '1',
				userId: TEST_USER_ID,
				invoiceId,
				orderId: TEST_ORDER_ID,
			}).toItem()
			await createInvoice(userMock)
			const deletedInvoice = await deleteInvoice(invoiceId, TEST_PRODUCT_ID)
			expect(deletedInvoice).toMatchInlineSnapshot(`
      {
        "amount": "1",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "invoiceId": "deleteInvoiceId",
        "orderId": "12345",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
      }
    `)
		})
		test('should return an error when trying to delete a warehouse item that does not exist', async () => {
			const error = await getError(async () =>
				deleteInvoice('doesntExistInvoiceId', TEST_PRODUCT_ID),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: You cannot delete a invoice that does not exist.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('deleteItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				deleteInvoice('doesntExistInvoiceId', TEST_PRODUCT_ID),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})
})
