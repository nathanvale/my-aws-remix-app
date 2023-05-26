/* eslint-disable jest/no-disabled-tests */
import {
	createShipmentItem,
	deleteShipmentItem,
	readShipmentItem,
	updateShipmentItem,
	ShipmentItemItem,
} from '../shipment-item.server.ts'
import ulid from 'ulid'
import { ShipmentItemError } from '../errors.ts'
import {
	clientApiMethodReject,
	clientApiMethodResolve,
	TEST_SHIPMENT_ID,
	TEST_ORDER_ID,
	TEST_PRODUCT_ID,
	TEST_SHIPMENT_ITEM_ID,
} from 'dynamodb/db-test-helpers.ts'
import * as client from '../../../../dynamodb/client.ts'
import * as log from '../../log.ts'

import { createShipmentItemSeed } from 'dynamodb/seed-utils.ts'

const createdNow = new Date('2022-12-01T00:00:00.000Z')
const updatedNow = new Date('2022-12-05T00:00:00.000Z')

beforeEach(() => {
	vi.restoreAllMocks()
	vi.spyOn(log, 'logError').mockReturnValue('id')
	vi.useFakeTimers()
	vi.setSystemTime(createdNow)
})
describe.skip('Skip for now...', () => {
	describe('ShipmentItem', () => {
		test('should get a DynamoDB attribute map of a warehouse item', async () => {
			const shipmentItem = new ShipmentItemItem({
				orderId: TEST_ORDER_ID,
				createdAt: '2021-01-01T00:00:00.000Z',
				quantity: '3',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentId: TEST_SHIPMENT_ID,
				productId: TEST_PRODUCT_ID,
				shipmentItemId: TEST_SHIPMENT_ITEM_ID,
			}).toDynamoDBItem()

			expect(shipmentItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "orderId": {
              "S": "12345",
            },
            "productId": {
              "S": "12345",
            },
            "quantity": {
              "S": "3",
            },
            "shipmentId": {
              "S": "12345",
            },
            "shipmentItemId": {
              "S": "12345",
            },
            "updatedAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
          },
        },
        "EntityType": {
          "S": "shipmentItem",
        },
        "GS2PK": {
          "S": "SHIPMENT#12345",
        },
        "GS2SK": {
          "S": "PRODUCT#12345",
        },
        "PK": {
          "S": "ORDER#12345",
        },
        "SK": {
          "S": "SHIPMENT_ITEM#12345",
        },
      }
    `)
		})

		test('should get GSI attribute values', () => {
			const result = ShipmentItemItem.getGSIAttributeValues(
				'shipmentId',
				'productId',
			)
			expect(result).toMatchInlineSnapshot(`
      {
        "GS2PK": {
          "S": "SHIPMENT#shipmentId",
        },
        "GS2SK": {
          "S": "PRODUCT#productId",
        },
      }
    `)
		})
	})

	describe('createShipment', () => {
		test('should create a shipment item', async () => {
			const shipmentItemId = 'newShipmentItemId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentItemId)
			const userMock = new ShipmentItemItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				quantity: '3',
				shipmentItemId,
				shipmentId: TEST_SHIPMENT_ID,
				orderId: TEST_ORDER_ID,
				productId: TEST_PRODUCT_ID,
			}).toItem()
			const createdUser = await createShipmentItem(userMock)
			await deleteShipmentItem(shipmentItemId, TEST_ORDER_ID)
			expect(createdUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "productId": "12345",
        "quantity": "3",
        "shipmentId": "12345",
        "shipmentItemId": "newShipmentItemId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('putItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				createShipmentItem(createShipmentItemSeed()),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('readShipment', () => {
		test('should read a shipment item', async () => {
			const result = await readShipmentItem(TEST_SHIPMENT_ID, TEST_PRODUCT_ID)
			expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2020-06-21",
        "orderId": "12345",
        "productId": "12345",
        "quantity": "50",
        "shipmentId": "12345",
        "shipmentItemId": "12345",
        "updatedAt": "2020-06-21",
      }
    `)
		})

		test('should return an error when getting a shipment item that does not exist', async () => {
			const result = await getError(async () =>
				readShipmentItem('unknownShipmentId', TEST_PRODUCT_ID),
			)
			expect(result).toMatchInlineSnapshot('[Error: Shipment item not found.]')
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('getItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				readShipmentItem(TEST_SHIPMENT_ID, TEST_PRODUCT_ID),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('updateShipment', () => {
		test('should update a shipment item', async () => {
			const shipmentItemId = 'updateShipmentItemId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentItemId)
			const userMock = new ShipmentItemItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentItemId,
				orderId: TEST_ORDER_ID,
				quantity: '3',
				productId: TEST_PRODUCT_ID,
				shipmentId: TEST_SHIPMENT_ID,
			}).toItem()
			const createdShipment = await createShipmentItem(userMock)
			const quantity = '4'
			vi.setSystemTime(updatedNow)
			const updatedShipment = await updateShipmentItem({
				...createdShipment,
				quantity,
			})
			await deleteShipmentItem(shipmentItemId, TEST_PRODUCT_ID)
			expect(updatedShipment).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "productId": "12345",
        "quantity": "4",
        "shipmentId": "12345",
        "shipmentItemId": "updateShipmentItemId",
        "updatedAt": "2022-12-05T00:00:00.000Z",
      }
    `)
		})

		test('should throw an error is a shipment item does not exist', async () => {
			const result = await getError(async () =>
				updateShipmentItem({
					...createShipmentItemSeed(),
					shipmentItemId: 'unknownShipmentItemId',
				}),
			)
			expect(result).toMatchInlineSnapshot(
				'[Error: You cannot delete a shipment item that does not exist.]',
			)
		})
		test('should throw an when an item update doesnt return values', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodResolve('updateItem', {}),
			)
			const error = await getError<ShipmentItemError>(async () =>
				updateShipmentItem({
					...createShipmentItemSeed(),
					shipmentItemId: '',
				}),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: Shipment item updates must return all attributes of the item.]',
			)
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('updateItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				updateShipmentItem({
					...createShipmentItemSeed(),
					shipmentItemId: '',
				}),
			)

			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('deleteShipment', () => {
		test('should delete a shipment item', async () => {
			const shipmentItemId = 'deleteShipmentItemId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentItemId)
			const userMock = new ShipmentItemItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentItemId,
				shipmentId: TEST_SHIPMENT_ID,
				orderId: TEST_ORDER_ID,
				quantity: '3',
				productId: TEST_PRODUCT_ID,
			}).toItem()
			await createShipmentItem(userMock)
			const deletedShipment = await deleteShipmentItem(
				shipmentItemId,
				TEST_ORDER_ID,
			)
			expect(deletedShipment).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "productId": "12345",
        "quantity": "3",
        "shipmentId": "12345",
        "shipmentItemId": "deleteShipmentItemId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `)
		})
		test('should return an error when trying to delete a warehouse item that does not exist', async () => {
			const error = await getError(async () =>
				deleteShipmentItem('doesntExistShipmentId', TEST_ORDER_ID),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: You cannot delete a shipment item that does not exist.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('deleteItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				deleteShipmentItem('doesntExistShipmentId', TEST_ORDER_ID),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})
})
