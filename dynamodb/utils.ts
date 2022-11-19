import type { DynamoDB } from "aws-sdk";
import AWS from "aws-sdk";
import invariant from "tiny-invariant";
import { getClient } from "./client";

/**
 * https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html
 */
export enum AWSErrorCodes {
  CONDITIONAL_CHECK_FAILED_EXCEPTION = "ConditionalCheckFailedException",
}

export type PrimaryKeyAttributeValues = Record<
  PrimaryKeys,
  DynamoDB.AttributeValue
>;

export type GSIKeyAttributeValue = Record<GSIKeys, DynamoDB.AttributeValue>;

export type PrimaryKeys = "PK" | "SK";
export type GSIKeys = "GS1PK" | "GS1SK" | "GS2PK" | "GS2SK" | "GS3PK" | "GS3SK";

/**
 * Matches the keys and attributes on the DynamoDB table.
 */
export type ModelKeys = PrimaryKeys | GSIKeys | "EntityType" | "Attributes";

export type DynamoDBItem = Record<ModelKeys, DynamoDB.AttributeValue>;

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html
 * @param item
 * @returns
 */
export const unmarshall = <T>(item: DynamoDB.AttributeMap) =>
  AWS.DynamoDB.Converter.unmarshall(item) as T;

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/Converter.html
 * @param item
 * @returns
 */
export const marshall = (item: any) => AWS.DynamoDB.Converter.marshall(item);

/**
 * Checks to see if there are any missing DynamoDB attributes for
 * the attributes of a data model.
 * @param attributes
 * @param mapAttributeValue
 */
export const checkForDBAttributes = (
  attributes: {},
  mapAttributeValue: DynamoDB.MapAttributeValue
) => {
  Object.keys(attributes).map((key) => {
    return invariant(mapAttributeValue[key], `No item attributes.${key}!`);
  });
};

/**
 * Creates a DynamoDB item from a DynamoDB item.
 * @param dynamoDBItem
 * @returns
 */
export const createItem = async (dynamoDBItem: DynamoDBItem) => {
  const { client, TableName } = await getClient();
  try {
    const result = await client
      .putItem({
        TableName,
        Item: dynamoDBItem,
      })
      .promise();
    return result.Attributes;
  } catch (error) {
    throw error;
  }
};

/**
 * Reads a DynamoDB item from a DynamoDB key.
 * @param Key
 * @returns
 */
export const readItem = async (Key: PrimaryKeyAttributeValues) => {
  const { client, TableName } = await getClient();
  try {
    return await client
      .getItem({
        TableName,
        Key,
      })
      .promise();
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a DynamoDB item from a DynamoDB key and attributes.
 * @param Key
 * @param Attributes
 * @param doesNotExistsError
 * @returns
 */
export const updateItem = async (
  key: PrimaryKeyAttributeValues,
  attributes: DynamoDB.AttributeValue
) => {
  const { client, TableName } = await getClient();

  return await client
    .updateItem({
      TableName,
      Key: key,
      UpdateExpression: "set Attributes = :val",
      ConditionExpression: "attribute_exists(PK)",
      ExpressionAttributeValues: {
        ":val": attributes,
      },
      ReturnValues: "ALL_NEW",
    })
    .promise();
};

export const deleteItem = async (key: PrimaryKeyAttributeValues) => {
  const { client, TableName } = await getClient();
  try {
    return await client
      .deleteItem({
        TableName,
        Key: key,
        ReturnValues: "ALL_OLD",
      })
      .promise();
  } catch (error) {
    throw error;
  }
};
