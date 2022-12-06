import { DynamoDB, AWSError } from "aws-sdk";
import { ulid } from "ulid";
import { Base, Item } from "../base";
import {
  AWSErrorCodes,
  createItem,
  deleteItem,
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
import { ProductError } from "./errors";

export interface Product extends Base {
  readonly productId: string;
  company: string;
  price: string;
  description: string;
}

export class ProductItem extends Item {
  readonly attributes: Product;

  constructor(attributes: Product) {
    super();
    this.attributes = {
      ...attributes,
    };
  }

  static fromItem(item?: DynamoDB.AttributeMap): ProductItem {
    invariant(item, "No item!");
    invariant(item.Attributes, "No attributes!");
    invariant(item.Attributes.M, "No attributes!");
    const product = new ProductItem({
      createdAt: "",
      updatedAt: "",
      productId: "",
      company: "",
      price: "",
      description: "",
    });
    const itemAttributes = item.Attributes.M;

    checkForDBAttributes(product.attributes, itemAttributes);

    const { Attributes } = unmarshall<{
      Attributes: Product;
    }>(item);

    return new ProductItem(Attributes);
  }

  static getPrimaryKeyAttributeValues(
    productId: Product["productId"]
  ): PrimaryKeyAttributeValues {
    const product = new ProductItem({
      createdAt: "",
      updatedAt: "",
      productId: productId,
      company: "",
      price: "",
      description: "",
    });
    return product.keys();
  }

  get entityType(): string {
    return `product`;
  }

  get PK(): `PRODUCT#${string}` {
    return `PRODUCT#${this.attributes.productId}`;
  }

  get SK() {
    return `PRODUCT#${this.attributes.productId}`;
  }

  get GS1PK() {
    return "";
  }

  get GS1SK() {
    return "";
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

  toItem(): Product {
    return {
      createdAt: this.attributes.createdAt,
      updatedAt: this.attributes.updatedAt,
      company: this.attributes.company,
      description: this.attributes.description,
      price: this.attributes.price,
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

export const createProduct = async (
  product: Omit<Product, "productId" | "createdAt" | "updatedAt">
): Promise<Product> => {
  const productItem = new ProductItem({
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productId: ulid(),
  });
  await createItem(productItem.toDynamoDBItem());
  return productItem.attributes;
};

export const readProduct = async (productId: string): Promise<Product> => {
  const key = ProductItem.getPrimaryKeyAttributeValues(productId);
  const resp = await readItem(key);
  if (resp.Item) return ProductItem.fromItem(resp.Item).attributes;
  else throw new ProductError("PRODUCT_NOT_FOUND");
};

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const key = ProductItem.getPrimaryKeyAttributeValues(product.productId);
    const productItem = new ProductItem({
      ...product,
      updatedAt: new Date().toISOString(),
    });
    const resp = await updateItem(key, productItem.toDynamoDBItem().Attributes);
    if (resp?.Attributes)
      return ProductItem.fromItem(resp.Attributes).attributes;
    else throw new ProductError("PRODUCT_UPDATES_MUST_RETURN_VALUES");
  } catch (error) {
    if (
      (error as AWSError).code ===
      AWSErrorCodes.CONDITIONAL_CHECK_FAILED_EXCEPTION
    )
      throw new ProductError("PRODUCT_DOES_NOT_EXIST");
    else throw error;
  }
};

export const deleteProduct = async (
  productId: Product["productId"]
): Promise<Product> => {
  const key = ProductItem.getPrimaryKeyAttributeValues(productId);
  const resp = await deleteItem(key);
  if (resp.Attributes) return ProductItem.fromItem(resp.Attributes).attributes;
  else throw new ProductError("PRODUCT_DOES_NOT_EXIST");
};
