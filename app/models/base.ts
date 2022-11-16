import { DynamoDB } from "aws-sdk";

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

export abstract class Item {
  abstract get PK(): string;
  abstract get SK(): string;
  abstract get GS1PK(): string;
  abstract get GS1SK(): string;
  abstract get GS2PK(): string;
  abstract get GS2SK(): string;
  abstract get GS3PK(): string;
  abstract get GS3SK(): string;
  abstract get entityType(): string;

  public keys(): PrimaryKeyAttributeValues {
    return {
      PK: { S: this.PK },
      SK: { S: this.SK },
    };
  }

  public gSIKeys(): GSIKeyAttributeValue {
    return {
      GS1PK: { S: this.GS1PK },
      GS1SK: { S: this.GS1SK },
      GS2PK: { S: this.GS2PK },
      GS2SK: { S: this.GS2SK },
      GS3PK: { S: this.GS3PK },
      GS3SK: { S: this.GS3SK },
    };
  }

  abstract toDynamoDBItem(): Record<string, unknown>;
}
