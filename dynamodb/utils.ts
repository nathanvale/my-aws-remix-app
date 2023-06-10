import {
	GetItemCommand,
	UpdateItemCommand,
	PutItemCommand,
	DeleteItemCommand,
	type AttributeValue,
} from '@aws-sdk/client-dynamodb'
import {
	unmarshall as AWSUnmarshall,
	marshall as AWSMarshall,
} from '@aws-sdk/util-dynamodb'
import {
	type QueryCommandInput,
	QueryCommand,
	BatchWriteCommand,
	type BatchWriteCommandInput,
} from '@aws-sdk/lib-dynamodb'

import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import type { PutRequest, DeleteRequest } from '@aws-sdk/client-dynamodb'

import invariant from 'tiny-invariant'
import { getClient } from './client.ts'
import { setTimeout } from 'timers/promises'

/**
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html
 */
export enum AWSErrorCodes {
	CONDITIONAL_CHECK_FAILED_EXCEPTION = 'ConditionalCheckFailedException',
}

export type PrimaryKeyAttributeValues = Record<PrimaryKeys, AttributeValue>

export type GSIKeyAttributeValue = Partial<Record<GSIKeys, AttributeValue>>

export type PrimaryKeys = 'PK' | 'SK'
export type GSIKeys = 'GS1PK' | 'GS1SK' | 'GS2PK' | 'GS2SK' | 'GS3PK' | 'GS3SK'
export type AttributeMap = Record<string, AttributeValue>
/*
 * Matches the keys and attributes on the DynamoDB table.
 */
export type ModelKeys = PrimaryKeys | 'EntityType' | 'Attributes'

export type DynamoDBItem =
	| Record<ModelKeys, AttributeValue> & Partial<Record<GSIKeys, AttributeValue>>

export interface WriteRequestItems {
	PutRequest?: Omit<PutRequest, 'Item'> & {
		Item: Record<string, NativeAttributeValue> | undefined
	}
	DeleteRequest?: Omit<DeleteRequest, 'Key'> & {
		Key: Record<string, NativeAttributeValue> | undefined
	}
}
/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html
 * @param item
 * @returns
 */
export const unmarshall = <T>(item: AttributeMap) => AWSUnmarshall(item) as T

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html
 * @param item
 * @returns
 */
export const marshall = (item: any) => AWSMarshall(item)

/**
 * Checks to see if there are any missing DynamoDB attributes for
 * the attributes of a data model.
 * @param attributes
 * @param mapAttributeValue
 */
export const checkForDBAttributes = (
	attributes: {},
	mapAttributeValue: AttributeMap,
) => {
	Object.keys(attributes).map(key => {
		return invariant(mapAttributeValue[key], `No item attributes.${key}!`)
	})
}

/**
 * Creates a DynamoDB item from a DynamoDB item.
 * @param item
 * @returns
 */
export const createItem = async (item: AttributeMap) => {
	const { client, TableName } = await getClient()
	const command = new PutItemCommand({
		TableName,
		Item: item,
	})
	const result = await client.send(command)
	return result.Attributes
}

/**
 * Reads a DynamoDB item from a DynamoDB key.
 * @param Key
 * @returns
 */
export const readItem = async (key: Record<PrimaryKeys, string>) => {
	const { client, TableName } = await getClient()
	const command = new GetItemCommand({
		TableName,
		Key: marshall(key),
	})
	const resp = await client.send(command)
	return resp.Item ? unmarshall<Record<string, any>>(resp.Item) : null
}

/**
 * Updates a DynamoDB item from a DynamoDB key and attributes.
 * @param Key
 * @param Attributes
 * @param doesNotExistsError
 * @returns
 */
export const updateItem = async (
	key: Record<PrimaryKeys, string>,
	attributes: AttributeValue,
) => {
	const { client, TableName } = await getClient()
	const command = new UpdateItemCommand({
		TableName,
		Key: marshall(key),
		UpdateExpression: 'set Attributes = :val',
		ConditionExpression: 'attribute_exists(PK)',
		ExpressionAttributeValues: {
			':val': attributes,
		},
		ReturnValues: 'ALL_NEW',
	})
	const resp = await client.send(command)
	return resp.Attributes
		? unmarshall<Record<string, any>>(resp.Attributes)
		: null
}

/**
 * Deletes a DynamoDB item from a DynamoDB key.
 * @param key
 * @returns
 */
export const deleteItem = async (key: Record<PrimaryKeys, string>) => {
	const { client, TableName } = await getClient()
	const command = new DeleteItemCommand({
		TableName,
		Key: marshall(key),
		ReturnValues: 'ALL_OLD',
	})
	const resp = await client.send(command)
	return resp.Attributes
		? unmarshall<Record<string, any>>(resp.Attributes)
		: null
}

export const query = async (input: Omit<QueryCommandInput, 'TableName'>) => {
	const { client, TableName } = await getClient()
	const asd: QueryCommandInput = { TableName, ...input }
	console.log(asd)
	const queryCommand = new QueryCommand(asd)
	return await client.send(queryCommand)
}

/**
 * The BatchWriteItem operation puts or deletes multiple items in one or more
 * tables. A single call to BatchWriteItem can transmit up to 16MB of data over
 * the network, consisting of up to 25 item put or delete operations. Typically,
 * you would call BatchWriteItem in a loop. Each iteration would check for
 * unprocessed items and submit a new BatchWriteItem request with those
 * unprocessed items
 * @param requestItems
 * @param retryCount
 */
export const batchWrite = async (
	requestItems: WriteRequestItems[],
	retryCount = 0,
) => {
	const { client, TableName } = await getClient()
	const batchWriteCommandInput: BatchWriteCommandInput = {
		RequestItems: {
			[TableName]: requestItems,
		},
	}
	const batchWriteCommand = new BatchWriteCommand(batchWriteCommandInput)
	const batchWriteCommandOutput = await client.send(batchWriteCommand)
	const unprocessedItems = batchWriteCommandOutput.UnprocessedItems

	if (
		unprocessedItems &&
		unprocessedItems[TableName] &&
		unprocessedItems[TableName].length > 0
	) {
		if (retryCount > 8) {
			return unprocessedItems[TableName]
		}
		//If DynamoDB returns any unprocessed items, you should retry the batch
		//operation on those items. However, AWS strongly recommend that you use
		//an exponential backoff algorithm. If you retry the batch operation
		//immediately, the underlying read or write requests can still fail due
		//to throttling on the individual tables. If you delay the batch
		//operation using exponential backoff, the individual requests in the
		//batch are much more likely to succeed.
		await setTimeout(2 ** retryCount * 10)
		await batchWrite(unprocessedItems[TableName], retryCount + 1)
	}
	return unprocessedItems?.[TableName] || []
}

/**
 * Maps a DynamoDB item to a WriteRequestItems object for a batch write.
 * @param item
 * @returns
 */
export const mapToDeleteItem = ({
	PK,
	SK,
}: Record<PrimaryKeys, string>): WriteRequestItems => ({
	DeleteRequest: {
		Key: {
			PK,
			SK,
		},
	},
})
