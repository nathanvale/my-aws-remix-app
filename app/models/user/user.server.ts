import { DynamoDB, AWSError } from "aws-sdk";
import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { Ok, Err, Result } from "ts-results";
import { Item } from "../base";
import { GSIKeyAttributeValue } from "../base";
import { ModelKeys } from "../base";
import { PrimaryKeyAttributeValues } from "../base";
import { getClient } from "../client";
import invariant from "tiny-invariant";
import { checkForDBAttributes, marshall, unmarshall } from "../utils.server";
import { AWSErrorCodes, UnknownError } from "../errors";
import { UserError } from "./errors";

export interface User {
  readonly userId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  campaignCount?: number;
}

export class UserItem extends Item {
  readonly attributes: User;

  constructor(attributes: User) {
    super();
    this.attributes = {
      ...attributes,
      firstName: attributes.firstName || "",
      lastName: attributes.lastName || "",
      campaignCount: attributes.campaignCount || 0,
    };
  }

  static fromItem(item?: DynamoDB.AttributeMap): UserItem {
    invariant(item, "No item!");
    invariant(item.Attributes, "No attributes!");
    invariant(item.Attributes.M, "No attributes!");
    const user = new UserItem({ userId: "", email: "", password: "" });
    const itemAttributes = item.Attributes.M;

    checkForDBAttributes(user.attributes, itemAttributes);

    const { Attributes } = unmarshall<{
      Attributes: User;
    }>(item);

    return new UserItem(Attributes);
  }

  static getPrimaryKeyAttributeValues(
    userId: User["userId"]
  ): PrimaryKeyAttributeValues {
    const note = new UserItem({ userId, email: "", password: "" });
    return note.keys();
  }

  static getGSIAttributeValues(
    userId: User["userId"],
    email: User["email"]
  ): GSIKeyAttributeValue {
    const note = new UserItem({ userId, email, password: "" });
    return note.gSIKeys();
  }

  get entityType(): string {
    return `user`;
  }

  get PK(): `USER#${string}` {
    return `USER#${this.attributes.userId}`;
  }

  get SK(): `USER#${string}` {
    return `USER#${this.attributes.userId}`;
  }

  get GS1PK(): `USER#${string}` {
    return `USER#${this.attributes.email}`;
  }

  get GS1SK(): `USER#${string}` {
    return `USER#${this.attributes.email}`;
  }

  get GS2PK() {
    return "";
  }

  get GS2SK() {
    return "";
  }

  get GS3PK() {
    return "";
  }

  get GS3SK() {
    return "";
  }

  toDynamoDBItem(): Record<ModelKeys, DynamoDB.AttributeValue> {
    return {
      ...this.keys(),
      ...this.gSIKeys(),
      EntityType: { S: this.entityType },
      Attributes: {
        M: marshall(this.attributes),
      },
    };
  }
}

export const createUser = async (
  email: User["email"],
  password: User["password"]
): Promise<Result<User, UserError | UnknownError>> => {
  const { client, TableName } = await getClient();
  const hashedPassword = await bcrypt.hash(password, 10);
  const userItem = new UserItem({
    userId: ulid(),
    email,
    password: hashedPassword,
  });
  try {
    await client
      .putItem({
        TableName,
        Item: userItem.toDynamoDBItem(),
      })
      .promise();
    return new Ok(userItem.attributes);
  } catch (error) {
    return new Err(new UnknownError(error));
  }
};

export const readUser = async (
  userId: string
): Promise<Result<User, UserError | UnknownError>> => {
  const { client, TableName } = await getClient();
  const Key = UserItem.getPrimaryKeyAttributeValues(userId);
  try {
    const resp = await client
      .getItem({
        TableName,
        Key,
      })
      .promise();
    if (resp.Item) return new Ok(UserItem.fromItem(resp.Item).attributes);
    else return new Err(new UserError("USER_NOT_FOUND"));
  } catch (error) {
    return new Err(new UnknownError(error));
  }
};

export const updateUser = async (
  user: User
): Promise<Result<User, UserError | UnknownError>> => {
  const { client, TableName } = await getClient();
  const Key = UserItem.getPrimaryKeyAttributeValues(user.userId);
  const userItem = new UserItem(user);
  try {
    const resp = await client
      .updateItem({
        TableName,
        Key,
        UpdateExpression: "set Attributes = :val",
        ConditionExpression: "attribute_exists(PK)",
        ExpressionAttributeValues: {
          ":val": userItem.toDynamoDBItem().Attributes,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();
    if (resp.Attributes)
      return new Ok(UserItem.fromItem(resp.Attributes).attributes);
    else return new Err(new UserError("USER_UPDATES_MUST_RETURN_VALUES"));
  } catch (error) {
    if (
      (error as AWSError).code ===
      AWSErrorCodes.CONDITIONAL_CHECK_FAILED_EXCEPTION
    )
      return new Err(new UserError("USER_DOES_NOT_EXIST"));
    else return new Err(new UnknownError(error));
  }
};

export const deleteUser = async (
  userId: User["userId"]
): Promise<Result<User, UserError | UnknownError>> => {
  const { client, TableName } = await getClient();
  const Key = UserItem.getPrimaryKeyAttributeValues(userId);
  try {
    const resp = await client
      .deleteItem({
        TableName,
        Key,
        ReturnValues: "ALL_OLD",
      })
      .promise();
    if (resp.Attributes)
      return new Ok(UserItem.fromItem(resp.Attributes).attributes);
    else return Err(new UserError("USER_DOES_NOT_EXIST"));
  } catch (error) {
    return new Err(new UnknownError(error));
  }
};

export const getUserByEmail = async function (
  email: User["email"]
): Promise<Result<User, UserError | UnknownError>> {
  const { client, TableName } = await getClient();
  const gSIKeys = UserItem.getGSIAttributeValues("", email);
  try {
    const resp = await client
      .query({
        TableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GS1PK = :GS1PK AND GS1SK = :GS1SK",
        ExpressionAttributeValues: {
          ":GS1PK": gSIKeys.GS1PK,
          ":GS1SK": gSIKeys.GS1SK,
        },
      })
      .promise();
    if (resp.Items && resp.Count && resp.Count > 0)
      return new Ok(
        resp.Items.map((item) => UserItem.fromItem(item))[0].attributes
      );
    else return new Err(new UserError("USER_NOT_FOUND"));
  } catch (error) {
    return new Err(new UnknownError(error));
  }
};

export const verifyEmailNotExist = async (
  email: User["email"]
): Promise<Result<boolean, UserError | UnknownError>> => {
  const result = await getUserByEmail(email);
  if (result.ok) return new Err(new UserError("USER_ALREADY_EXISTS"));
  else if (result.val instanceof UnknownError) {
    return new Err(new UnknownError(result.val));
  }
  return new Ok(true);
};

export const verifyLogin = async (
  email: User["email"],
  password: User["password"]
): Promise<Result<User, UserError>> => {
  const result = await getUserByEmail(email);
  if (result.err) return new Err(result.val);
  const existingUser = result.val;
  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) return new Err(new UserError("USER_PASSWORD_INVALID"));
  return new Ok(existingUser);
};
