import { ulid } from 'ulid'
import { Base, Item } from '../base.ts'
import invariant from 'tiny-invariant'
import {
	batchWrite,
	createItem,
	deleteItem,
	mapToDeleteItem,
	query,
	readItem,
	updateItem,
} from 'dynamodb/utils.ts'

export interface User extends Base {
	readonly userId: string
	email: string
	password: string
	username: string
	name: string
	image?: string
}

const EntityType = 'user'
export class UserItem extends Item {
	readonly attributes: User

	constructor(attributes: User) {
		super()
		this.attributes = {
			...attributes,
			username: attributes.username || '',
			name: attributes.name || '',
		}
	}

	static fromItem(item: Record<string, any>): UserItem {
		invariant(item.Attributes, 'No attributes!')
		invariant(item.EntityType, 'No entityType!')
		invariant(item.EntityType === EntityType, 'Not a user entityType!')
		const user = new UserItem(item.Attributes)
		return user
	}

	static getPrimaryKeys(userId: User['userId']) {
		const user = new UserItem({
			createdAt: '',
			updatedAt: '',
			userId,
			email: '',
			password: '',
			name: '',
			username: '',
		})
		return user.keys()
	}

	static getGSIKeys({ email = '', userId = '', username = '' }) {
		const user = new UserItem({
			createdAt: '',
			updatedAt: '',
			userId,
			email,
			password: '',
			name: '',
			username,
		})
		return user.gSIKeys()
	}

	get entityType(): string {
		return EntityType
	}

	get PK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get SK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get GS1PK(): `USER#${string}` {
		return `USER#${this.attributes.email}`
	}

	get GS1SK(): `USER#${string}` {
		return `USER#${this.attributes.email}`
	}

	get GS2PK(): `USER#${string}` {
		return `USER#${this.attributes.username}`
	}

	get GS2SK(): `USER#${string}` {
		return `USER#${this.attributes.username}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): User {
		return {
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			name: this.attributes.name,
			email: this.attributes.email,
			password: this.attributes.password,
			userId: this.attributes.userId,
			username: this.attributes.username,
		}
	}
}

export const createUser = async (
	user: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<User> => {
	const userItem = new UserItem({
		...user,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		userId: ulid(),
	})
	await createItem(userItem.toDynamoDBItem())
	return userItem.attributes
}

export const readUser = async (userId: string): Promise<User | null> => {
	const key = UserItem.getPrimaryKeys(userId)
	const item = await readItem(key)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const updateUser = async (user: User): Promise<User | null> => {
	const key = UserItem.getPrimaryKeys(user.userId)
	const userItem = new UserItem({
		...user,
		updatedAt: new Date().toISOString(),
	})
	const item = await updateItem(key, userItem.toDynamoDBItem().Attributes)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const deleteUserById = async (
	userId: User['userId'],
): Promise<User | null> => {
	const key = UserItem.getPrimaryKeys(userId)
	const item = await deleteItem(key)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}
export const deleteUserByUsername = async (
	userName: User['username'],
): Promise<User | null> => {
	const user = await getUserByUsername(userName)
	if (!user) return null
	const key = UserItem.getPrimaryKeys(user?.userId)
	const item = await deleteItem(key)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const getUserByEmail = async function (
	email: User['email'],
): Promise<User | null> {
	const gSIKeys = UserItem.getGSIKeys({ email })
	const resp = await query({
		IndexName: 'GSI1',
		KeyConditionExpression: 'GS1PK = :GS1PK AND GS1SK = :GS1SK',
		ExpressionAttributeValues: {
			':GS1PK': gSIKeys.GS1PK,
			':GS1SK': gSIKeys.GS1SK,
		},
	})
	if (resp.Items && resp.Count && resp.Count > 0)
		return resp.Items.map(item => UserItem.fromItem(item))[0].attributes
	else return null
}
export const getUserByUsername = async function (
	username: User['username'],
): Promise<User | null> {
	const gSIKeys = UserItem.getGSIKeys({ username })
	console.log(JSON.stringify(gSIKeys))
	const resp = await query({
		IndexName: 'GSI2',
		KeyConditionExpression: 'GS2PK = :GS2PK AND GS2SK = :GS2SK',
		ExpressionAttributeValues: {
			':GS2PK': gSIKeys.GS2PK,
			':GS2SK': gSIKeys.GS2SK,
		},
	})

	if (resp.Items && resp.Count && resp.Count > 0)
		return resp.Items.map(item => UserItem.fromItem(item))[0].attributes
	else return null
}
export const deleteManyUsers = async (userIds: User['userId'][]) => {
	const deleteRequests = userIds.map(userId => {
		return mapToDeleteItem(UserItem.getPrimaryKeys(userId))
	})
	return await batchWrite(deleteRequests)
}
