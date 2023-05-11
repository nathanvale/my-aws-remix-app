import {
  GSIKeyAttributeValue,
  PrimaryKeyAttributeValues,
} from "dynamodb/utils";

export interface Base {
  readonly createdAt: string;
  readonly updatedAt: string;
}
export abstract class Item {
  abstract get PK(): string;
  abstract get SK(): string;
  abstract get GS1PK(): string | undefined;
  abstract get GS1SK(): string | undefined;
  abstract get GS2PK(): string | undefined;
  abstract get GS2SK(): string | undefined;
  abstract get GS3PK(): string | undefined;
  abstract get GS3SK(): string | undefined;
  abstract get entityType(): string;
  abstract toDynamoDBItem(): Record<string, unknown>;
  abstract toItem(): Record<string, any>;

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
}
