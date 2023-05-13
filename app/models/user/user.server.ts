import { DynamoDB, AWSError } from "aws-sdk";
import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { Base, Item } from "../base";
import { getClient } from "dynamodb/client";
import invariant from "tiny-invariant";
import {
  AWSErrorCodes,
  checkForDBAttributes,
  createItem,
  deleteItem,
  DynamoDBItem,
  GSIKeyAttributeValue,
  marshall,
  PrimaryKeyAttributeValues,
  readItem,
  unmarshall,
  updateItem,
} from "dynamodb/utils";
import { UserError } from "./errors";

export interface User extends Base {
  readonly userId: string;
  email: string;
  password: string;
  username: string;
  name: string;
}

export class UserItem extends Item {
  readonly attributes: User;

  constructor(attributes: User) {
    super();
    this.attributes = {
      ...attributes,
      username: attributes.username || "",
      name: attributes.name || "",
    };
  }

  static fromItem(item?: DynamoDB.AttributeMap): UserItem {
    invariant(item, "No item!");
    invariant(item.Attributes, "No attributes!");
    invariant(item.Attributes.M, "No attributes!");
    const user = new UserItem({
      createdAt: "",
      updatedAt: "",
      userId: "",
      email: "",
      password: "",
      name: "",
      username: "",
    });
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
    const user = new UserItem({
      createdAt: "",
      updatedAt: "",
      userId,
      email: "",
      password: "",
      name: "",
      username: "",
    });
    return user.keys();
  }

  static getGSIAttributeValues(
    userId: User["userId"],
    email: User["email"]
  ): GSIKeyAttributeValue {
    const user = new UserItem({
      createdAt: "",
      updatedAt: "",
      userId,
      email,
      password: "",
      name: "",
      username: "",
    });
    return user.gSIKeys();
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
    return undefined;
  }

  get GS2SK() {
    return undefined;
  }

  get GS3PK() {
    return undefined;
  }

  get GS3SK() {
    return undefined;
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
    };
  }

  toDynamoDBItem(): DynamoDBItem {
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
  user: Omit<User, "userId" | "createdAt" | "updatedAt">
): Promise<User> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const userItem = new UserItem({
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: ulid(),
    password: hashedPassword,
  });
  await createItem(userItem.toDynamoDBItem());
  return userItem.attributes;
};

export const readUser = async (userId: string): Promise<User> => {
  const key = UserItem.getPrimaryKeyAttributeValues(userId);
  const resp = await readItem(key);
  if (resp.Item) return UserItem.fromItem(resp.Item).attributes;
  else throw new UserError("USER_NOT_FOUND");
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const key = UserItem.getPrimaryKeyAttributeValues(user.userId);
    const productItem = new UserItem({
      ...user,
      updatedAt: new Date().toISOString(),
    });
    const resp = await updateItem(key, productItem.toDynamoDBItem().Attributes);
    if (resp?.Attributes) return UserItem.fromItem(resp.Attributes).attributes;
    else throw new UserError("USER_UPDATES_MUST_RETURN_VALUES");
  } catch (error) {
    if (
      (error as AWSError).code ===
      AWSErrorCodes.CONDITIONAL_CHECK_FAILED_EXCEPTION
    )
      throw new UserError("USER_DOES_NOT_EXIST");
    else throw error;
  }
};

export const deleteUser = async (userId: User["userId"]): Promise<User> => {
  const key = UserItem.getPrimaryKeyAttributeValues(userId);
  const resp = await deleteItem(key);
  if (resp.Attributes) return UserItem.fromItem(resp.Attributes).attributes;
  else throw new UserError("USER_DOES_NOT_EXIST");
};

export const getUserByEmail = async function (
  email: User["email"]
): Promise<User> {
  const { client, TableName } = await getClient();
  const gSIKeys = UserItem.getGSIAttributeValues("", email);
  invariant(gSIKeys.GS1PK, "Missing GS1PK!");
  invariant(gSIKeys.GS1SK, "Missing GlS1SK!");
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
      return resp.Items.map((item) => UserItem.fromItem(item))[0].attributes;
    else throw new UserError("USER_NOT_FOUND");
  } catch (error) {
    if (error instanceof UserError) throw error;
    throw error;
  }
};

export const verifyEmailNotExist = async (
  email: User["email"]
): Promise<boolean> => {
  let user: User;
  try {
    user = await getUserByEmail(email);
    if (user.email === email) throw new UserError("USER_ALREADY_EXISTS");
  } catch (error) {
    if (error instanceof UserError) {
      if (error.code === "USER_NOT_FOUND") return true;
    }
    throw error;
  }
  // We should never get here but need to keep TS happy
  /* c8 ignore next */
  return false;
};

export const verifyLogin = async (
  email: User["email"],
  password: User["password"]
): Promise<User> => {
  const existingUser = await getUserByEmail(email);
  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) throw new UserError("USER_PASSWORD_INVALID");
  return existingUser;
};
