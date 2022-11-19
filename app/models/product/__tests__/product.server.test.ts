import bcrypt from "bcryptjs";
import {
  createProduct,
  deleteProduct,
  readProduct,
  updateProduct,
  ProductItem,
} from "../product.server";
import { ulid } from "ulid";
import { ProductError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_PRODUCT_ID,
} from "../../../../test/db-test-helpers";
import * as client from "../../../../dynamodb/client";
import * as log from "../../log";
import { createProductSeed } from "dynamodb/seed-utils";
import { Mock } from "vitest";

vi.mock("ulid");

let mockedUlid = ulid as Mock;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(log, "logError").mockReturnValue("id");
  vi.spyOn(bcrypt, "hash").mockReturnValue("hashed-password" as any);
});

describe("ProductItem", () => {
  test("should get a DynamoDB attribute map of a product", async () => {
    const productItem = new ProductItem({
      productId: TEST_PRODUCT_ID,
      description: "description",
      company: "company",
      price: "price",
    }).toDynamoDBItem();
    expect(productItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "company": {
              "S": "company",
            },
            "description": {
              "S": "description",
            },
            "price": {
              "S": "price",
            },
            "productId": {
              "S": "12345",
            },
          },
        },
        "EntityType": {
          "S": "product",
        },
        "GS1PK": {
          "S": "",
        },
        "GS1SK": {
          "S": "",
        },
        "GS2PK": {
          "S": "",
        },
        "GS2SK": {
          "S": "",
        },
        "GS3PK": {
          "S": "",
        },
        "GS3SK": {
          "S": "",
        },
        "PK": {
          "S": "PRODUCT#12345",
        },
        "SK": {
          "S": "PRODUCT#12345",
        },
      }
    `);
  });
});

describe("createProduct", () => {
  test("should create a product", async () => {
    const productSeed = createProductSeed();
    const productId = "newProductId";
    mockedUlid.mockReturnValue(productId);
    const createdProduct = await createProduct(productSeed);
    await deleteProduct(productId);
    expect(Object.keys(createdProduct).length).toBe(4);
    expect(createdProduct.company).toBe(productSeed.company);
    expect(createdProduct.description).toBe(productSeed.description);
    expect(createdProduct.price).toBe(productSeed.price);
    expect(createdProduct.productId).toBe(productId);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      createProduct(createProductSeed())
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("readProduct", () => {
  test("should read a product", async () => {
    const result = await readProduct(TEST_PRODUCT_ID);
    expect(result).toMatchInlineSnapshot(`
      {
        "company": "Mann - Thiel",
        "description": "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
        "price": "143.00",
        "productId": "12345",
      }
    `);
  });

  test("should return an error when getting a product that does not exist", async () => {
    const result = await getError(async () =>
      readProduct("unknown.product@test.com")
    );
    expect(result).toMatchInlineSnapshot(`
        ProductError {
          "code": "PRODUCT_NOT_FOUND",
          "id": "id",
          "message": "Product not found.",
          "statusCode": 400,
        }
      `);
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      readProduct(TEST_PRODUCT_ID)
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("updateProduct", () => {
  test("should update a product", async () => {
    const productSeed = createProductSeed();
    const productId = "updateProductId";
    mockedUlid.mockReturnValue(productId);
    const createdProduct = await createProduct(productSeed);
    const updatedCompany = "updatedCompany";
    const updatedProduct = await updateProduct({
      ...createdProduct,
      company: updatedCompany,
    });
    await deleteProduct(productId);
    expect(Object.keys(updatedProduct).length).toBe(4);
    expect(updatedProduct.company).toBe(updatedCompany);
    expect(updatedProduct.description).toBe(productSeed.description);
    expect(updatedProduct.price).toBe(productSeed.price);
    expect(updatedProduct.productId).toBe(productId);
  });

  test("should throw an error is a product does not exist", async () => {
    const result = await getError(async () =>
      updateProduct({
        ...createProductSeed(),
        productId: "unknownProductId",
      })
    );
    expect(result).toMatchInlineSnapshot(`
      ProductError {
        "code": "PRODUCT_DOES_NOT_EXIST",
        "id": "id",
        "message": "You cannot delete a product that does not exist.",
        "statusCode": 400,
      }
    `);
  });

  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const error = await getError<ProductError>(async () =>
      updateProduct({
        ...createProductSeed(),
        productId: "",
      })
    );
    expect(error).toMatchInlineSnapshot(`
      ProductError {
        "code": "PRODUCT_UPDATES_MUST_RETURN_VALUES",
        "id": "id",
        "message": "Product updates must return all attributes of the item.",
        "statusCode": 500,
      }
    `);
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      updateProduct({
        ...createProductSeed(),
        productId: "",
      })
    );

    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("deleteProduct", () => {
  test("should delete a product", async () => {
    const productSeed = createProductSeed();
    const productId = "deleteProductId";
    mockedUlid.mockReturnValue(productId);
    await createProduct(productSeed);
    const deletedProduct = await deleteProduct(productId);
    expect(Object.keys(deletedProduct).length).toBe(4);
    expect(deletedProduct.company).toBe(productSeed.company);
    expect(deletedProduct.description).toBe(productSeed.description);
    expect(deletedProduct.price).toBe(productSeed.price);
    expect(deletedProduct.productId).toBe(productId);
  });
  test("should return an error when trying to delete a product that does not exist", async () => {
    const error = await getError(async () =>
      deleteProduct("doesntExistProductId")
    );
    expect(error).toMatchInlineSnapshot(`
        ProductError {
          "code": "PRODUCT_DOES_NOT_EXIST",
          "id": "id",
          "message": "You cannot delete a product that does not exist.",
          "statusCode": 400,
        }
      `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      deleteProduct("doesntExistProductId")
    );
    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});