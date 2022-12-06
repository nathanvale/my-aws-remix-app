import { DynamoDB, AWSError } from "aws-sdk";
import { ulid } from "ulid";
import { Base, Item } from "../base";
import {
  AWSErrorCodes,
  createItem,
  deleteItem,
  GSIKeyAttributeValue,
  PrimaryKeyAttributeValues,
  readItem,
  updateItem,
} from "dynamodb/utils";
import invariant from "tiny-invariant";
import {
  checkForDBAttributes,
  DynamoDBItem,
  marshall,
  unmarshall,
} from "../../../dynamodb/utils";
import { WarehouseItemError } from "./errors";

export interface WarehouseItem extends Base {
  readonly warehouseItemId: string;
  readonly warehouseId: string;
  readonly productId: string;
  quantity: string;
}

export class WarehouseItemItem extends Item {
  readonly attributes: WarehouseItem;

  constructor(attributes: WarehouseItem) {
    super();
    this.attributes = {
      ...attributes,
    };
  }

  static fromItem(item?: DynamoDB.AttributeMap): WarehouseItemItem {
    invariant(item, "No item!");
    invariant(item.Attributes, "No attributes!");
    invariant(item.Attributes.M, "No attributes!");
    const warehouseItem = new WarehouseItemItem({
      createdAt: "",
      updatedAt: "",
      productId: "",
      quantity: "",
      warehouseId: "",
      warehouseItemId: "",
    });
    const itemAttributes = item.Attributes.M;

    checkForDBAttributes(warehouseItem.attributes, itemAttributes);

    const { Attributes } = unmarshall<{
      Attributes: WarehouseItem;
    }>(item);

    return new WarehouseItemItem(Attributes);
  }

  static getPrimaryKeyAttributeValues(
    warehouseItemId: WarehouseItem["warehouseItemId"],
    productId: WarehouseItem["productId"]
  ): PrimaryKeyAttributeValues {
    const warehouseItem = new WarehouseItemItem({
      warehouseItemId: warehouseItemId,
      warehouseId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: "0",
      productId: productId,
    });
    return warehouseItem.keys();
  }

  static getGSIAttributeValues(
    createdAt: WarehouseItem["createdAt"],
    warehouseId: WarehouseItem["warehouseId"]
  ): GSIKeyAttributeValue {
    const user = new WarehouseItemItem({
      createdAt,
      updatedAt: "",
      productId: "",
      quantity: "",
      warehouseId,
      warehouseItemId: "",
    });
    return user.gSIKeys();
  }

  get entityType(): string {
    return `warehouseItem`;
  }

  get PK(): `PRODUCT#${string}` {
    return `PRODUCT#${this.attributes.productId}`;
  }

  get SK(): `WAREHOUSE_ITEM#${string}` {
    return `WAREHOUSE_ITEM#${this.attributes.warehouseItemId}`;
  }

  get GS1PK() {
    return "";
  }

  get GS1SK() {
    return "";
  }

  get GS2PK(): `WAREHOUSE#${string}` {
    return `WAREHOUSE#${this.attributes.warehouseId}`;
  }

  get GS2SK(): `WAREHOUSE_ITEM#${string}` {
    return `WAREHOUSE_ITEM#${this.attributes.createdAt}`;
  }

  get GS3PK() {
    return "";
  }

  get GS3SK() {
    return "";
  }

  toItem(): WarehouseItem {
    return {
      createdAt: this.attributes.createdAt,
      updatedAt: this.attributes.updatedAt,
      quantity: this.attributes.quantity,
      warehouseId: this.attributes.warehouseId,
      warehouseItemId: this.attributes.warehouseItemId,
      productId: this.attributes.productId,
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

export const createWarehouseItem = async (
  warehouseItem: Omit<
    WarehouseItem,
    "warehouseItemId" | "createdAt" | "updatedAt"
  >
): Promise<WarehouseItem> => {
  const warehouseItemItem = new WarehouseItemItem({
    ...warehouseItem,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    warehouseItemId: ulid(),
  });
  await createItem(warehouseItemItem.toDynamoDBItem());
  return warehouseItemItem.attributes;
};

export const readWarehouseItem = async (
  warehouseItemId: string,
  productId: string
): Promise<WarehouseItem> => {
  const key = WarehouseItemItem.getPrimaryKeyAttributeValues(
    warehouseItemId,
    productId
  );
  const resp = await readItem(key);
  if (resp.Item) return WarehouseItemItem.fromItem(resp.Item).attributes;
  else throw new WarehouseItemError("WAREHOUSE_ITEM_NOT_FOUND");
};

export const updateWarehouseItem = async (
  warehouseItem: WarehouseItem
): Promise<WarehouseItem> => {
  try {
    const key = WarehouseItemItem.getPrimaryKeyAttributeValues(
      warehouseItem.warehouseItemId,
      warehouseItem.productId
    );
    const warehouseItemItem = new WarehouseItemItem({
      ...warehouseItem,
      updatedAt: new Date().toISOString(),
    });
    const resp = await updateItem(
      key,
      warehouseItemItem.toDynamoDBItem().Attributes
    );
    if (resp?.Attributes)
      return WarehouseItemItem.fromItem(resp.Attributes).attributes;
    else
      throw new WarehouseItemError("WAREHOUSE_ITEM_UPDATES_MUST_RETURN_VALUES");
  } catch (error) {
    if (
      (error as AWSError).code ===
      AWSErrorCodes.CONDITIONAL_CHECK_FAILED_EXCEPTION
    )
      throw new WarehouseItemError("WAREHOUSE_ITEM_DOES_NOT_EXIST");
    else throw error;
  }
};

export const deleteWarehouseItem = async (
  warehouseItemId: WarehouseItem["warehouseItemId"],
  productId: WarehouseItem["productId"]
): Promise<WarehouseItem> => {
  const key = WarehouseItemItem.getPrimaryKeyAttributeValues(
    warehouseItemId,
    productId
  );
  const resp = await deleteItem(key);
  if (resp.Attributes)
    return WarehouseItemItem.fromItem(resp.Attributes).attributes;
  else throw new WarehouseItemError("WAREHOUSE_ITEM_DOES_NOT_EXIST");
};
