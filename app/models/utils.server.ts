import AWS, { DynamoDB } from "aws-sdk";
import invariant from "tiny-invariant";

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
