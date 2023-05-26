/* eslint-disable jest/no-disabled-tests */
import {
	createShipment,
	deleteShipment,
	readShipment,
	updateShipment,
	ShipmentItem,
} from '../shipment.server.ts'
import ulid from 'ulid'
import { ShipmentError } from '../errors.ts'
import {
	clientApiMethodReject,
	clientApiMethodResolve,
	TEST_SHIPMENT_ID,
	TEST_ORDER_ID,
	TEST_PRODUCT_ID,
	TEST_WAREHOUSE_ID,
} from 'dynamodb/db-test-helpers.ts'
import * as client from '../../../../dynamodb/client.ts'
import * as log from '../../log.ts'

import { createShipmentSeed } from 'dynamodb/seed-utils.ts'

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
			const shipmentItem = new ShipmentItem({
				orderId: TEST_ORDER_ID,
				createdAt: '2021-01-01T00:00:00.000Z',
				address: '123 Main St',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentId: TEST_SHIPMENT_ID,
				warehouseId: TEST_WAREHOUSE_ID,
			}).toDynamoDBItem()

			expect(shipmentItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "address": {
              "S": "123 Main St",
            },
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "orderId": {
              "S": "12345",
            },
            "shipmentId": {
              "S": "12345",
            },
            "updatedAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "warehouseId": {
              "S": "12345",
            },
          },
        },
        "EntityType": {
          "S": "shipment",
        },
        "GS1PK": {
          "S": "WAREHOUSE#12345",
        },
        "GS1SK": {
          "S": "SHIPMENT#2021-01-01T00:00:00.000Z",
        },
        "GS2PK": {
          "S": "SHIPMENT#12345",
        },
        "GS2SK": {
          "S": "SHIPMENT#12345",
        },
        "PK": {
          "S": "ORDER#12345",
        },
        "SK": {
          "S": "SHIPMENT#12345",
        },
      }
    `)
		})

		test('should get GSI attribute values', () => {
			const result = ShipmentItem.getGSIAttributeValues(
				'2021-01-01T00:00:00.000Z',
				'warehouseId',
				'shipmentId',
			)
			expect(result).toMatchInlineSnapshot(`
      {
        "GS1PK": {
          "S": "WAREHOUSE#warehouseId",
        },
        "GS1SK": {
          "S": "SHIPMENT#2021-01-01T00:00:00.000Z",
        },
        "GS2PK": {
          "S": "SHIPMENT#shipmentId",
        },
        "GS2SK": {
          "S": "SHIPMENT#shipmentId",
        },
      }
    `)
		})
	})

	describe('createShipment', () => {
		test('should create a warehouse item', async () => {
			const shipmentId = 'newShipmentId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentId)
			const userMock = new ShipmentItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				address: '123 Main St',
				warehouseId: TEST_WAREHOUSE_ID,
				shipmentId,
				orderId: TEST_ORDER_ID,
			}).toItem()
			const createdUser = await createShipment(userMock)
			await deleteShipment(shipmentId, TEST_ORDER_ID)
			expect(createdUser).toMatchInlineSnapshot(`
      {
        "address": "123 Main St",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "shipmentId": "newShipmentId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "warehouseId": "12345",
      }
    `)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('putItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				createShipment(createShipmentSeed()),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('readShipment', () => {
		test('should read a warehouse item', async () => {
			const result = await readShipment(TEST_SHIPMENT_ID, TEST_PRODUCT_ID)
			expect(result).toMatchInlineSnapshot(`
      {
        "address": "596 Kuhlman Extensions",
        "createdAt": "2022-10-02T05:54:06.069Z",
        "orderId": "12345",
        "shipmentId": "12345",
        "updatedAt": "2022-12-03T01:24:47.781Z",
        "warehouseId": "12345",
      }
    `)
		})

		test('should return an error when getting a warehouse item that does not exist', async () => {
			const result = await getError(async () =>
				readShipment('unknownShipmentId', TEST_PRODUCT_ID),
			)
			expect(result).toMatchInlineSnapshot('[Error: Shipment item not found.]')
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('getItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				readShipment(TEST_SHIPMENT_ID, TEST_PRODUCT_ID),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('updateShipment', () => {
		test('should update a shipment item', async () => {
			const shipmentId = 'updateShipmentId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentId)
			const userMock = new ShipmentItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentId,
				orderId: TEST_ORDER_ID,
				address: '123 Main St',
				warehouseId: TEST_WAREHOUSE_ID,
			}).toItem()
			const createdShipment = await createShipment(userMock)
			const address = 'updatedAddress'
			vi.setSystemTime(updatedNow)
			const updatedShipment = await updateShipment({
				...createdShipment,
				address,
			})
			await deleteShipment(shipmentId, TEST_PRODUCT_ID)
			expect(updatedShipment).toMatchInlineSnapshot(`
      {
        "address": "updatedAddress",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "shipmentId": "updateShipmentId",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "warehouseId": "12345",
      }
    `)
		})

		test('should throw an error is a warehouse item does not exist', async () => {
			const result = await getError(async () =>
				updateShipment({
					...createShipmentSeed(),
					shipmentId: 'unknownShipmentId',
				}),
			)
			expect(result).toMatchInlineSnapshot(
				'[Error: You cannot delete a shipment that does not exist.]',
			)
		})
		test('should throw an when an item update doesnt return values', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodResolve('updateItem', {}),
			)
			const error = await getError<ShipmentError>(async () =>
				updateShipment({
					...createShipmentSeed(),
					shipmentId: '',
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
				updateShipment({
					...createShipmentSeed(),
					shipmentId: '',
				}),
			)

			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('deleteShipment', () => {
		test('should delete a warehouse item', async () => {
			const shipmentId = 'deleteShipmentId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(shipmentId)
			const userMock = new ShipmentItem({
				createdAt: '2021-01-01T00:00:00.000Z',
				updatedAt: '2021-01-01T00:00:00.000Z',
				shipmentId,
				orderId: TEST_ORDER_ID,
				address: '123 Main St',
				warehouseId: TEST_WAREHOUSE_ID,
			}).toItem()
			await createShipment(userMock)
			const deletedShipment = await deleteShipment(shipmentId, TEST_PRODUCT_ID)
			expect(deletedShipment).toMatchInlineSnapshot(`
      {
        "address": "123 Main St",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "shipmentId": "deleteShipmentId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "warehouseId": "12345",
      }
    `)
		})
		test('should return an error when trying to delete a warehouse item that does not exist', async () => {
			const error = await getError(async () =>
				deleteShipment('doesntExistShipmentId', TEST_PRODUCT_ID),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: You cannot delete a shipment that does not exist.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('deleteItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				deleteShipment('doesntExistShipmentId', TEST_PRODUCT_ID),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})
})
