/* eslint-disable jest/no-disabled-tests */
import bcrypt from 'bcryptjs'
import {
	createUser,
	deleteUser,
	getUserByEmail,
	readUser,
	updateUser,
	UserItem,
	verifyEmailNotExist,
	verifyLogin,
} from '../user.server'
import ulid from 'ulid'
import { UserError } from '../errors'
import {
	clientApiMethodReject,
	clientApiMethodResolve,
	TEST_USER_EMAIL,
	TEST_USER_ID,
} from 'dynamodb/db-test-helpers'
import * as client from 'dynamodb/client'
import * as log from '../../log'
import { SpyInstance } from 'vitest'
import { createUserSeed } from 'dynamodb/seed-utils'

let compareSpy: SpyInstance
const createdNow = new Date('2022-12-01T00:00:00.000Z')
const updatedNow = new Date('2022-12-05T00:00:00.000Z')

beforeEach(() => {
	vi.restoreAllMocks()
	vi.spyOn(log, 'logError').mockReturnValue('id')
	vi.spyOn(bcrypt, 'hash').mockReturnValue('hashed-password' as any)
	compareSpy = vi.spyOn(bcrypt, 'compare')
	vi.useFakeTimers()
	vi.setSystemTime(createdNow)
})
describe.skip('Skip for now...', () => {
	describe('UserItem', () => {
		test('should get a DynamoDB attribute map of a user', async () => {
			const userItem = new UserItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				userId: TEST_USER_ID,
				email: TEST_USER_EMAIL,
				password: 'password',
				username: 'username',
				name: 'name',
			}).toDynamoDBItem()
			expect(userItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "createdAt": {
              "S": "2021-08-01T00:00:00.000Z",
            },
            "email": {
              "S": "test@test.com",
            },
            "name": {
              "S": "name",
            },
            "password": {
              "S": "password",
            },
            "updatedAt": {
              "S": "2021-08-01T00:00:00.000Z",
            },
            "userId": {
              "S": "12345",
            },
            "username": {
              "S": "username",
            },
          },
        },
        "EntityType": {
          "S": "user",
        },
        "GS1PK": {
          "S": "USER#test@test.com",
        },
        "GS1SK": {
          "S": "USER#test@test.com",
        },
        "PK": {
          "S": "USER#12345",
        },
        "SK": {
          "S": "USER#12345",
        },
      }
    `)
		})
	})

	describe('createUser', () => {
		test('should create a user', async () => {
			const userId = 'newUser'
			vi.spyOn(ulid, 'ulid').mockReturnValue(userId)
			const userMock = new UserItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				email: 'email',
				name: 'name',
				password: 'password',
				username: 'username',
				userId: 'newUserId',
			}).toItem()
			const createdUser = await createUser(userMock)
			await deleteUser(userId)
			expect(createdUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "email": "email",
        "name": "name",
        "password": "hashed-password",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "newUser",
        "username": "username",
      }
    `)
		}, 10000)
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('putItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () =>
				createUser(createUserSeed()),
			)
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('readUser', () => {
		test('should read a user', async () => {
			const result = await readUser(TEST_USER_ID)
			expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-08-31T05:46:41.205Z",
        "email": "test@test.com",
        "name": "Test User",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "updatedAt": "2022-11-25T13:45:46.999Z",
        "userId": "12345",
        "username": "test_user",
      }
    `)
		})

		test('should return an error when getting a user that does not exist', async () => {
			const result = await getError(async () =>
				readUser('unknown.user@test.com'),
			)
			expect(result).toMatchInlineSnapshot('[Error: User not found.]')
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('getItem', new Error('Unknown error')),
			)
			const result = await getError<Error>(async () => readUser(TEST_USER_ID))
			delete result.stack
			expect(result).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('updateUser', () => {
		test('should update a user', async () => {
			const userId = 'updateUserId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(userId)
			const userMock = new UserItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				email: 'email',
				name: 'name',
				password: 'password',
				username: 'username',
				userId: 'newUserId',
			}).toItem()
			const createdUser = await createUser(userMock)
			const updatedUserName = 'updatedUserName'
			const updatedName = 'updatedName'
			vi.setSystemTime(updatedNow)
			const updatedUser = await updateUser({
				...createdUser,
				username: updatedUserName,
				name: updatedName,
			})
			await deleteUser(userId)
			expect(updatedUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "email": "email",
        "name": "updatedName",
        "password": "hashed-password",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "userId": "updateUserId",
        "username": "updatedUserName",
      }
    `)
		})

		test('should throw an error is a user does not exist', async () => {
			const result = await getError(async () =>
				updateUser({
					...createUserSeed(),
					userId: 'unknownUserId',
				}),
			)
			expect(result).toMatchInlineSnapshot(
				'[Error: You cannot delete a user that does not exist.]',
			)
		})

		test('should throw an when an item update doesnt return values', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodResolve('updateItem', {}),
			)
			const error = await getError<UserError>(async () =>
				updateUser({
					...createUserSeed(),
					userId: '',
				}),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: User updates must return all attributes of the item.]',
			)
		})

		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('updateItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				updateUser({
					...createUserSeed(),
					userId: '',
				}),
			)

			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('deleteUser', () => {
		test('should delete a user', async () => {
			const userId = 'deleteUserId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(userId)
			const userMock = new UserItem({
				createdAt: '2021-08-01T00:00:00.000Z',
				updatedAt: '2021-08-01T00:00:00.000Z',
				email: 'email',
				name: 'name',
				password: 'password',
				username: 'username',
				userId: 'newUserId',
			}).toItem()
			await createUser(userMock)
			const deletedUser = await deleteUser(userId)
			expect(deletedUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "email": "email",
        "name": "name",
        "password": "hashed-password",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "deleteUserId",
        "username": "username",
      }
    `)
		})
		test('should return an error when trying to delete a user that does not exist', async () => {
			const error = await getError(async () => deleteUser('doesntExistUserId'))
			expect(error).toMatchInlineSnapshot(
				'[Error: You cannot delete a user that does not exist.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('deleteItem', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				deleteUser('doesntExistUserId'),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('getUserByEmail', () => {
		test('should get get a user by email', async () => {
			const user = await getUserByEmail(TEST_USER_EMAIL)
			expect(user).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-08-31T05:46:41.205Z",
        "email": "test@test.com",
        "name": "Test User",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "updatedAt": "2022-11-25T13:45:46.999Z",
        "userId": "12345",
        "username": "test_user",
      }
    `)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('query', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				getUserByEmail(TEST_USER_EMAIL),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('verifyEmailNotExist', () => {
		test('should verify that an email doesnt not exist', async () => {
			const result = await verifyEmailNotExist('doesnt.exist@test.com')
			expect(result).toBe(true)
		})

		test('should return an error when a user already exists', async () => {
			const error = await getError<UserError>(async () =>
				verifyEmailNotExist(TEST_USER_EMAIL),
			)
			expect(error).toMatchInlineSnapshot(
				'[Error: There is already an existing user with this email address.]',
			)
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('query', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				verifyEmailNotExist('doesnt.exist@test.com'),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})

	describe('verifyLogin', () => {
		test('should get an exisiting user', async () => {
			compareSpy.mockResolvedValue(true)
			const result = await verifyLogin(TEST_USER_EMAIL, 'password')
			expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-08-31T05:46:41.205Z",
        "email": "test@test.com",
        "name": "Test User",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "updatedAt": "2022-11-25T13:45:46.999Z",
        "userId": "12345",
        "username": "test_user",
      }
    `)
		})

		test('should return an error when verifying a user that does not exist', async () => {
			const error = await getError(async () =>
				verifyLogin('doesnt.exist@test.com', 'password'),
			)
			expect(error).toMatchInlineSnapshot('[Error: User not found.]')
		})

		test('should return an error when verifying a user with an invalid password', async () => {
			compareSpy.mockResolvedValue(false)
			const error = await getError(async () =>
				verifyLogin(TEST_USER_EMAIL, 'password'),
			)
			expect(error).toMatchInlineSnapshot('[Error: Invalid pasword.]')
		})
		test('should throw an error', async () => {
			vi.spyOn(client, 'getClient').mockResolvedValue(
				clientApiMethodReject('query', new Error('Unknown error')),
			)
			const error = await getError<Error>(async () =>
				verifyLogin(TEST_USER_EMAIL, 'password'),
			)
			delete error.stack
			expect(error).toMatchInlineSnapshot('[Error: Unknown error]')
		})
	})
})
