/* eslint-disable jest/no-disabled-tests */
import {
	createProduct,
	deleteProduct,
	readProduct,
	updateProduct,
	ProductItem,
} from '../product.server.ts'
import ulid from 'ulid'
import { ProductError } from '../errors.ts'
import {
	clientApiMethodReject,
	clientApiMethodResolve,
	TEST_PRODUCT_ID,
} from 'dynamodb/db-test-helpers.ts'
import * as client from 'dynamodb/client.ts'
import * as log from '../../log.ts'
import { createProductSeed } from 'dynamodb/seed-utils.ts'

const createdNow = new Date('2022-12-01T00:00:00.000Z')
const updatedNow = new Date('2022-12-05T00:00:00.000Z')

beforeEach(() => {
	vi.restoreAllMocks()
	vi.spyOn(log, 'logError').mockReturnValue('id')
	vi.useFakeTimers()
	vi.setSystemTime(createdNow)
})
describe.skip('Skip for now...', () => {
	describe('ProductItem', () => {
		test('should get a DynamoDB attribute map of a product', async () => {
			const productItem = new ProductItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				productId: TEST_PRODUCT_ID,
				description: 'description',
				company: 'company',
				price: 'price',
			}).toDynamoDBItem()
			expect(productItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "company": {
              "S": "company",
            },
            "createdAt": {
              "S": "2021-08-01T00:00:00.000Z",
            },
            "description": {
              "S": "description",
            },
            "price": {
              "S": "price",
            },
            "productId": {
              "S": "12345",
            },
            "updatedAt": {
              "S": "2021-08-01T00:00:00.000Z",
            },
          },
        },
        "EntityType": {
          "S": "product",
        },
        "PK": {
          "S": "PRODUCT#12345",
        },
        "SK": {
          "S": "PRODUCT#12345",
        },
      }
    `)
		})
	})

	describe('createProduct', () => {
		test('should create a product', async () => {
			const productId = 'newProductId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(productId)
			const userMock = new ProductItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				company: 'company',
				description: 'description',
				price: 'price',
				productId: productId,
			}).toItem()
			const createdUser = await createProduct(userMock)
			await deleteProduct(productId)
			expect(createdUser).toMatchInlineSnapshot(`
      {
        "company": "company",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "description": "description",
        "price": "price",
        "productId": "newProductId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('putItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				createProduct(createProductSeed()),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('readProduct', () => {
		test('should read a product', async () => {
			const result = await readProduct(TEST_PRODUCT_ID)
			expect(result).toMatchInlineSnapshot(`
      {
        "company": "Mann - Thiel",
        "createdAt": "2022-08-31T05:46:41.205Z",
        "description": "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
        "price": "143.00",
        "productId": "12345",
        "updatedAt": "2022-11-25T13:45:46.999Z",
      }
    `)
		})

		test('should return an error when getting a product that does not exist', async () => {
			const result = await getError(async () => readProduct('unknownProductId'))
			expect(result).toMatchInlineSnapshot('[Error: Product not found.]')
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('getItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				readProduct(TEST_PRODUCT_ID),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('updateProduct', () => {
		test('should update a product', async () => {
			const productId = 'updateProductId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(productId)
			const userMock = new ProductItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				company: 'company',
				description: 'description',
				price: 'price',
				productId: productId,
			}).toItem()
			const createdProduct = await createProduct(userMock)
			const updatedCompany = 'updatedCompany'
			vi.setSystemTime(updatedNow)
			const updatedProduct = await updateProduct({
				...createdProduct,
				company: updatedCompany,
			})
			await deleteProduct(productId)
			expect(updatedProduct).toMatchInlineSnapshot(`
      {
        "company": "updatedCompany",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "description": "description",
        "price": "price",
        "productId": "updateProductId",
        "updatedAt": "2022-12-05T00:00:00.000Z",
      }
    `)
		})

		test('should throw an error is a product does not exist', async () => {
			const result = await getError(async () =>
				updateProduct({
					...createProductSeed(),
					productId: 'unknownProductId',
				}),
			)
			expect(result).toMatchInlineSnapshot(
				'[Error: You cannot delete a product that does not exist.]',
			)
		})
		test('should throw an when an item update doesnt return values', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodResolve('updateItem', {}),
			)
			const error = await getError<ProductError>(async () =>
				updateProduct({
					...createProductSeed(),
					productId: '',
				}),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: Product updates must return all attributes of the item.]',
			)
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('updateItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				updateProduct({
					...createProductSeed(),
					productId: '',
				}),
			)

			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('deleteProduct', () => {
		test('should delete a product', async () => {
			const productId = 'deleteProductId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(productId)
			const userMock = new ProductItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				company: 'company',
				description: 'description',
				price: 'price',
				productId: productId,
			}).toItem()
			await createProduct(userMock)
			const deletedProduct = await deleteProduct(productId)
			expect(deletedProduct).toMatchInlineSnapshot(`
      {
        "company": "company",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "description": "description",
        "price": "price",
        "productId": "deleteProductId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `)
		})
		test('should return an error when trying to delete a product that does not exist', async () => {
			const error = await getError(async () =>
				deleteProduct('doesntExistProductId'),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: You cannot delete a product that does not exist.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('deleteItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				deleteProduct('doesntExistProductId'),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})
})
