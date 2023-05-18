/* ignore file coverage */
import { ulid } from 'ulid'
import { DynamoDB } from 'aws-sdk'
import { Item } from '../base'

import invariant from 'tiny-invariant'
import { getClient } from 'dynamodb/client'
import { UserItem } from '../user/user.server'
import {
	checkForDBAttributes,
	DynamoDBItem,
	marshall,
	PrimaryKeyAttributeValues,
	unmarshall,
} from 'dynamodb/utils'
interface NoteWithOptional {
	userId: string
	noteId: string
	title: string
	body?: string
}

export type Note = Required<NoteWithOptional>

export class NoteItem extends Item {
	attributes: Note

	constructor(attributes: NoteWithOptional) {
		super()
		this.attributes = {
			...attributes,
			body: attributes.body || '',
		}
	}

	static fromItem(item?: DynamoDB.AttributeMap): NoteItem {
		invariant(item, 'No item!')
		invariant(item.Attributes, 'No attributes!')
		invariant(item.Attributes.M, 'No attributes!')

		const note = new NoteItem({ noteId: '', userId: '', title: '' })
		const itemAttributes = item.Attributes.M

		checkForDBAttributes(note.attributes, itemAttributes)

		const { Attributes } = unmarshall<{
			Attributes: Note
		}>(item)

		return new NoteItem(Attributes)
	}

	static getPrimaryKeyAttributeValues(
		userId: Note['userId'],
		noteId: Note['noteId'],
	): PrimaryKeyAttributeValues {
		const note = new NoteItem({ userId, noteId, title: '' })
		return note.keys()
	}

	get entityType(): string {
		return `note`
	}

	get PK(): `USER#${string}` {
		return `USER#${this.attributes.userId}`
	}

	get SK(): `NOTE#${string}` {
		return `NOTE#${this.attributes.noteId}`
	}

	get GS1PK() {
		return undefined
	}

	get GS1SK() {
		return undefined
	}

	get GS2PK() {
		return undefined
	}

	get GS2SK() {
		return undefined
	}

	get GS3PK() {
		return undefined
	}

	get GS3SK() {
		return undefined
	}

	toItem(): Note {
		return {
			body: this.attributes.body,
			noteId: this.attributes.noteId,
			title: this.attributes.title,
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

export const createNote = async (
	note: Omit<NoteWithOptional, 'noteId'>,
): Promise<Note> => {
	const { client, TableName } = await getClient()
	const newNoteItem = new NoteItem({ ...note, noteId: ulid() })
	try {
		await client
			.putItem({
				TableName,
				Item: newNoteItem.toDynamoDBItem(),
				ConditionExpression: 'attribute_not_exists(pk)',
			})
			.promise()
		return newNoteItem.attributes
	} catch (error) {
		console.log('NoteMotel:createNote', error)
		throw error
	}
}

export const readNote = async (
	userId: Note['userId'],
	noteId: Note['noteId'],
): Promise<NoteItem | undefined> => {
	const { client, TableName } = await getClient()
	const Key = NoteItem.getPrimaryKeyAttributeValues(userId, noteId)
	try {
		const resp = await client
			.getItem({
				TableName,
				Key,
			})
			.promise()

		return resp.Item ? NoteItem.fromItem(resp.Item) : undefined
	} catch (error) {
		throw error
	}
}

export const deleteNote = async (
	userId: Note['userId'],
	noteId: Note['noteId'],
): Promise<Note> => {
	const { client, TableName } = await getClient()
	const Key = NoteItem.getPrimaryKeyAttributeValues(userId, noteId)
	try {
		const resp = await client
			.deleteItem({
				TableName,
				Key,
				ReturnValues: 'ALL_OLD',
			})
			.promise()
		if (resp.Attributes) return NoteItem.fromItem(resp.Attributes).attributes
		else throw new Error(`Cant delete note with keys ${JSON.stringify(Key)}`)
	} catch (error) {
		console.log('NoteMotel:deleteNote', error)
		throw error
	}
}

export async function getNoteListItems(
	userId: Note['userId'],
): Promise<Note[]> {
	const { client, TableName } = await getClient()
	const PK = UserItem.getPrimaryKeyAttributeValues(userId).PK
	try {
		const resp = await client
			.query({
				TableName,
				KeyConditionExpression: 'PK = :pk AND begins_with(SK, :note)',
				ExpressionAttributeValues: {
					':pk': PK,
					':note': { S: 'NOTE#' },
				},
				ScanIndexForward: false,
			})
			.promise()
		return resp.Items?.map(item => NoteItem.fromItem(item).attributes) || []
	} catch (error) {
		console.log('NoteMotel:getNoteListItems', error)
		throw error
	}
}
