import {
  createWarehouseItem,
  deleteWarehouseItem,
  readWarehouseItem,
  updateWarehouseItem,
  WarehouseItemItem,
} from "../warehouse-item.server";
import { ulid } from "ulid";
import { WarehouseItemError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_PRODUCT_ID,
  TEST_WAREHOUSE_ITEM_ID,
} from "dynamodb/db-test-helpers";
import * as client from "dynamodb/client";
import * as log from "../../log";
import { createWarehouseItemSeed } from "dynamodb/seed-utils";
import { Mock } from "vitest";

vi.mock("ulid");

let mockedUlid = ulid as Mock;
const createdNow = new Date("2022-12-01T00:00:00.000Z");
const updatedNow = new Date("2022-12-05T00:00:00.000Z");

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(log, "logError").mockReturnValue("id");
  vi.useFakeTimers();
  vi.setSystemTime(createdNow);
});

describe("WarehouseItemItem", () => {
  test("should get a DynamoDB attribute map of a warehouse item", async () => {
    const productItem = new WarehouseItemItem({
      productId: TEST_PRODUCT_ID,
      createdAt: "2021-01-01T00:00:00.000Z",
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
      warehouseItemId: "warehouseItemId",
    }).toDynamoDBItem();

    expect(productItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "productId": {
              "S": "12345",
            },
            "quantity": {
              "S": "1",
            },
            "updatedAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "warehouseId": {
              "S": "warehouseId",
            },
            "warehouseItemId": {
              "S": "warehouseItemId",
            },
          },
        },
        "EntityType": {
          "S": "warehouseItem",
        },
        "GS1PK": {
          "S": "WAREHOUSE#warehouseId",
        },
        "GS1SK": {
          "S": "WAREHOUSE_ITEM#2021-01-01T00:00:00.000Z",
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
          "S": "WAREHOUSE_ITEM#warehouseItemId",
        },
      }
    `);
  });

  test("should get GSI attribute values", () => {
    const result = WarehouseItemItem.getGSIAttributeValues(
      "2021-01-01T00:00:00.000Z",
      "warehouseId"
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "GS1PK": {
          "S": "WAREHOUSE#warehouseId",
        },
        "GS1SK": {
          "S": "WAREHOUSE_ITEM#2021-01-01T00:00:00.000Z",
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
      }
    `);
  });
});

describe("createWarehouseItem", () => {
  test("should create a warehouse item", async () => {
    const warehouseItemId = "newWarehouseItemId";
    mockedUlid.mockReturnValue(warehouseItemId);
    const userMock = new WarehouseItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
      warehouseItemId: "warehouseItemId",
    }).toItem();
    const createdUser = await createWarehouseItem(userMock);
    await deleteWarehouseItem(warehouseItemId, TEST_PRODUCT_ID);
    expect(createdUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "productId": "12345",
        "quantity": "1",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "warehouseId": "warehouseId",
        "warehouseItemId": "newWarehouseItemId",
      }
    `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      createWarehouseItem(createWarehouseItemSeed())
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("readWarehouseItem", () => {
  test("should read a warehouse item", async () => {
    const result = await readWarehouseItem(
      TEST_WAREHOUSE_ITEM_ID,
      TEST_PRODUCT_ID
    );
    expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2020-06-21",
        "productId": "12345",
        "quantity": "50",
        "updatedAt": "2020-06-21",
        "warehouseId": "12345",
        "warehouseItemId": "12345",
      }
    `);
  });

  test("should return an error when getting a warehouse item that does not exist", async () => {
    const result = await getError(async () =>
      readWarehouseItem("unknownWarehouseItemId", TEST_PRODUCT_ID)
    );
    expect(result).toMatchInlineSnapshot('[Error: Warehouse item not found.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      readWarehouseItem(TEST_WAREHOUSE_ITEM_ID, TEST_PRODUCT_ID)
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("updateWarehouseItem", () => {
  test("should update a warehouseItem item", async () => {
    const warehouseItemId = "updateWarehouseItemId";
    mockedUlid.mockReturnValue(warehouseItemId);
    const userMock = new WarehouseItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
      warehouseItemId: "warehouseItemId",
    }).toItem();
    const createdWarehouseItem = await createWarehouseItem(userMock);
    const quantity = "updatedQuantity";
    vi.setSystemTime(updatedNow);
    const updatedWarehouseItem = await updateWarehouseItem({
      ...createdWarehouseItem,
      quantity,
    });
    await deleteWarehouseItem(warehouseItemId, TEST_PRODUCT_ID);
    expect(updatedWarehouseItem).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "productId": "12345",
        "quantity": "updatedQuantity",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "warehouseId": "warehouseId",
        "warehouseItemId": "updateWarehouseItemId",
      }
    `);
  });

  test("should throw an error is a warehouse item does not exist", async () => {
    const result = await getError(async () =>
      updateWarehouseItem({
        ...createWarehouseItemSeed(),
        warehouseItemId: "unknownWarehouseItemId",
      })
    );
    expect(result).toMatchInlineSnapshot('[Error: You cannot delete a warehouse item that does not exist.]');
  });
  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const error = await getError<WarehouseItemError>(async () =>
      updateWarehouseItem({
        ...createWarehouseItemSeed(),
        warehouseItemId: "",
      })
    );
    expect(error).toMatchInlineSnapshot('[Error: Warehouse item updates must return all attributes of the item.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      updateWarehouseItem({
        ...createWarehouseItemSeed(),
        warehouseItemId: "",
      })
    );

    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("deleteWarehouseItem", () => {
  test("should delete a warehouse item", async () => {
    const warehouseItemId = "deleteWarehouseItemId";
    mockedUlid.mockReturnValue(warehouseItemId);
    const userMock = new WarehouseItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
      warehouseItemId: "warehouseItemId",
    }).toItem();
    await createWarehouseItem(userMock);
    const deletedWarehouseItem = await deleteWarehouseItem(
      warehouseItemId,
      TEST_PRODUCT_ID
    );
    expect(deletedWarehouseItem).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "productId": "12345",
        "quantity": "1",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "warehouseId": "warehouseId",
        "warehouseItemId": "deleteWarehouseItemId",
      }
    `);
  });
  test("should return an error when trying to delete a warehouse item that does not exist", async () => {
    const error = await getError(async () =>
      deleteWarehouseItem("doesntExistWarehouseItemId", TEST_PRODUCT_ID)
    );
    expect(error).toMatchInlineSnapshot('[Error: You cannot delete a warehouse item that does not exist.]');
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      deleteWarehouseItem("doesntExistWarehouseItemId", TEST_PRODUCT_ID)
    );
    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});
