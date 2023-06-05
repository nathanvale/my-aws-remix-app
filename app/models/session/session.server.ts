import { ulid } from 'ulid'
import { Base, Item } from '../base'
import {
	AttributeMap,
	batchWrite,
	createItem,
	deleteItem,
	PrimaryKeyAttributeValues,
	query,
	readItem,
	WriteRequestItems,
	updateItem,
	mapToDeleteItem,
} from 'dynamodb/utils'

import invariant from 'tiny-invariant'
import {
	checkForDBAttributes,
	DynamoDBItem,
	marshall,
	unmarshall,
} from '../../../dynamodb/utils'
import { SessionError } from './errors'
import { User } from '../user/user.server'

export interface Session extends Base {
	readonly sessionId: string
	expirationDate: string
	userId: string
}

export class SessionItem extends Item {
	readonly attributes: Session

	constructor(attributes: Session) {
		super()
		this.attributes = {
			...attributes,
		}
	}

	static fromItem(item: Record<string, any>): SessionItem {
		invariant(item.Attributes, 'No attributes!')
		invariant(item.EntityType, 'No entityType!')
		invariant(item.EntityType === 'session', 'Not a session entityType!')
		const session = new SessionItem(item.Attributes)
		return session
	}

	static getPrimaryKeyAttributeValues(
		sessionId: Session['sessionId'],
	): PrimaryKeyAttributeValues {
		const session = new SessionItem({
			createdAt: '',
			updatedAt: '',
			sessionId: sessionId,
			expirationDate: '',
			userId: '',
		})
		return session.keys()
	}

	get entityType(): string {
		return `session`
	}

	get PK(): `SESSION` {
		return `SESSION`
	}

	get SK() {
		return `SESSION#${this.attributes.sessionId}`
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

	get GS2SK(): `SESSION#${string}` {
		return `SESSION#${this.attributes.createdAt}`
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Session {
		return {
			sessionId: this.attributes.sessionId,
			createdAt: this.attributes.createdAt,
			updatedAt: this.attributes.updatedAt,
			expirationDate: this.attributes.expirationDate,
			userId: this.attributes.userId,
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

export const createSession = async ({
	expirationDate,
	userId,
}: Pick<Session, 'expirationDate' | 'userId'>): Promise<Session> => {
	const sessionItem = new SessionItem({
		expirationDate,
		userId,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		sessionId: ulid(),
	})
	await createItem(sessionItem.toDynamoDBItem())
	return sessionItem.attributes
}

export const readSession = async (
	sessionId: string,
): Promise<Session | null> => {
	const key = SessionItem.getPrimaryKeyAttributeValues(sessionId)
	const item = await readItem(key)
	if (item) return SessionItem.fromItem(item).attributes
	else return null
}

export const updateSession = async (session: Session): Promise<Session | null> => {
	const key = SessionItem.getPrimaryKeyAttributeValues(session.sessionId)
	const sessionItem = new SessionItem({
		...session,
		updatedAt: new Date().toISOString(),
	})
	const resp = await updateItem(key, sessionItem.toDynamoDBItem().Attributes)
	if (resp?.Attributes) return SessionItem.fromItem(resp.Attributes).attributes
	else return null
}

export const deleteSession = async (
	sessionId: Session['sessionId'],
): Promise<Session | null> => {
	const key = SessionItem.getPrimaryKeyAttributeValues(sessionId)
	const item = await deleteItem(key)
	if (item) return SessionItem.fromItem(item).attributes
	else return null
}

export const deleteAllUserSessions = async (userId: User['userId']) => {
	const queryCommandOutput = await query({
		IndexName: 'GSI2',
		KeyConditionExpression: 'GS2PK = :GS2PK AND begins_with(GS2SK, :GS2SK)',
		ExpressionAttributeValues: {
			':GS2PK': `USER#${userId}`,
			':GS2SK': `SESSION#`,
		},
	})
	const requestItems: WriteRequestItems[] =
		queryCommandOutput.Items?.map(mapToDeleteItem) || []
	return await batchWrite(requestItems)
}

export const deleteSessions = async (range?: {
	startDate: string
	endDate: string
}) => {
	const queryCommandOutput = await query({
		KeyConditionExpression: '#PK = :SESSION',
		FilterExpression:
			range && 'Attributes.#createdAt BETWEEN :startDate AND :endDate',
		ExpressionAttributeNames: {
			'#PK': 'PK',
			...(range && { '#createdAt': 'createdAt' }),
		},
		ExpressionAttributeValues: {
			':SESSION': 'SESSION',
			...(range && {
				':startDate': range.startDate,
				':endDate': range.endDate,
			}),
		},
	})
	const requestItems: WriteRequestItems[] =
		queryCommandOutput.Items?.map(mapToDeleteItem) || []
	return await batchWrite(requestItems)
}
