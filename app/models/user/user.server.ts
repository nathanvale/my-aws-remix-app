import { ulid } from 'ulid'
import { Base, Item } from '../base'
import invariant from 'tiny-invariant'
import {
	createItem,
	deleteItem,
	DynamoDBItem,
	marshall,
	PrimaryKeyAttributeValues,
	query,
	readItem,
	updateItem,
} from 'dynamodb/utils'

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

	static getPrimaryKeyAttributeValues(
		userId: User['userId'],
	): PrimaryKeyAttributeValues {
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

	static getGSIAttributeValues({
		email = '',
		userId = '',
		username = '',
	}: {
		userId?: User['userId']
		email?: User['email']
		username?: User['username']
	}) {
		const user = new UserItem({
			createdAt: '',
			updatedAt: '',
			userId,
			email,
			password: '',
			name: '',
			username,
		})
		return user.umarshalledGsiKeys()
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
	const key = UserItem.getPrimaryKeyAttributeValues(userId)
	const item = await readItem(key)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const updateUser = async (user: User): Promise<User | null> => {
	const key = UserItem.getPrimaryKeyAttributeValues(user.userId)
	const userItem = new UserItem({
		...user,
		updatedAt: new Date().toISOString(),
	})
	const item = await updateItem(key, userItem.toDynamoDBItem().Attributes)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const deleteUser = async (
	userId: User['userId'],
): Promise<User | null> => {
	const key = UserItem.getPrimaryKeyAttributeValues(userId)
	const item = await deleteItem(key)
	if (item) return UserItem.fromItem(item).attributes
	else return null
}

export const getUserByEmail = async function (
	email: User['email'],
): Promise<User | null> {
	const gSIKeys = UserItem.getGSIAttributeValues({ email })
	invariant(gSIKeys.GS1PK, 'Missing GS1PK!')
	invariant(gSIKeys.GS1SK, 'Missing GlS1SK!')

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
	const gSIKeys = UserItem.getGSIAttributeValues({ username })
	invariant(gSIKeys.GS2PK, 'Missing GS2PK!')
	invariant(gSIKeys.GS2SK, 'Missing GlS2SK!')

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
