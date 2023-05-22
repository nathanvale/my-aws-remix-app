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

import invariant from 'tiny-invariant'
import { getClient } from './client'

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
export const readItem = async (key: AttributeMap) => {
	const { client, TableName } = await getClient()
	const command = new GetItemCommand({
		TableName,
		Key: key,
	})
	return await client.send(command)
}

/**
 * Updates a DynamoDB item from a DynamoDB key and attributes.
 * @param Key
 * @param Attributes
 * @param doesNotExistsError
 * @returns
 */
export const updateItem = async (
	key: AttributeMap,
	attributes: AttributeValue,
) => {
	const { client, TableName } = await getClient()
	const command = new UpdateItemCommand({
		TableName,
		Key: key,
		UpdateExpression: 'set Attributes = :val',
		ConditionExpression: 'attribute_exists(PK)',
		ExpressionAttributeValues: {
			':val': attributes,
		},
		ReturnValues: 'ALL_NEW',
	})
	return await client.send(command)
}

export const deleteItem = async (key: AttributeMap) => {
	const { client, TableName } = await getClient()
	const command = new DeleteItemCommand({
		TableName,
		Key: key,
		ReturnValues: 'ALL_OLD',
	})
	return await client.send(command)
}
