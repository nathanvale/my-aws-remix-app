import {
  createWarehouse,
  deleteWarehouse,
  readWarehouse,
  updateWarehouse,
  WarehouseItem,
} from "../warehouse.server";
import { ulid } from "ulid";
import { WarehouseError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_PRODUCT_ID,
  TEST_USER_ID,
  TEST_WAREHOUSE_ID,
} from "dynamodb/db-test-helpers";
import * as client from "dynamodb/client";
import * as log from "../../log";
import { createWarehouseSeed } from "dynamodb/seed-utils";
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

describe("WarehouseItem", () => {
  test("should get a DynamoDB attribute map of a warehouse", async () => {
    const warehouseItem = new WarehouseItem({
      warehouseId: TEST_PRODUCT_ID,
      userId: TEST_USER_ID,
      createdAt: "2021-01-01T00:00:00.000Z",
      updatedAt: "2021-01-01T00:00:00.000Z",
      city: "New York",
    }).toDynamoDBItem();
    expect(warehouseItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "city": {
              "S": "New York",
            },
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "updatedAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "userId": {
              "S": "12345",
            },
            "warehouseId": {
              "S": "12345",
            },
          },
        },
        "EntityType": {
          "S": "warehouse",
        },
        "GS1PK": {
          "S": "",
        },
        "GS1SK": {
          "S": "",
        },
        "GS2PK": {
          "S": "USER#12345",
        },
        "GS2SK": {
          "S": "WAREHOUSE#12345",
        },
        "GS3PK": {
          "S": "",
        },
        "GS3SK": {
          "S": "",
        },
        "PK": {
          "S": "WAREHOUSE#12345",
        },
        "SK": {
          "S": "WAREHOUSE#12345",
        },
      }
    `);
  });

  test("should get GSI attribute values", () => {
    const result = WarehouseItem.getGSIAttributeValues("userId", "warehouseId");
    expect(result).toMatchInlineSnapshot(`
      {
        "GS1PK": {
          "S": "",
        },
        "GS1SK": {
          "S": "",
        },
        "GS2PK": {
          "S": "USER#userId",
        },
        "GS2SK": {
          "S": "WAREHOUSE#warehouseId",
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

describe("createWarehouse", () => {
  test("should create a warehouse", async () => {
    const warehouseId = "newWarehouseId";
    mockedUlid.mockReturnValue(warehouseId);
    const userMock = new WarehouseItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      userId: TEST_USER_ID,
      city: "New York",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
    }).toItem();
    const createdUser = await createWarehouse(userMock);
    await deleteWarehouse(warehouseId);
    expect(createdUser).toMatchInlineSnapshot(`
      {
        "city": "New York",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "newWarehouseId",
      }
    `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      createWarehouse(createWarehouseSeed())
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("readWarehouse", () => {
  test("should read a warehouse", async () => {
    const result = await readWarehouse(TEST_WAREHOUSE_ID);
    expect(result).toMatchInlineSnapshot(`
      {
        "city": "Fort Ellaboro",
        "createdAt": "2022-08-31T05:46:41.205Z",
        "updatedAt": "2022-11-25T13:45:46.999Z",
        "userId": "12345",
        "warehouseId": "12345",
      }
    `);
  });

  test("should return an error when getting a warehouse that does not exist", async () => {
    const result = await getError(async () =>
      readWarehouse("unknownWarehouseId")
    );
    expect(result).toMatchInlineSnapshot('[Error: Warehouse not found.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      readWarehouse(TEST_PRODUCT_ID)
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("updateWarehouse", () => {
  test("should update a warehouse", async () => {
    const warehouseId = "updateWarehouseId";
    mockedUlid.mockReturnValue(warehouseId);
    const userMock = new WarehouseItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      userId: TEST_USER_ID,
      city: "New York",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: warehouseId,
    }).toItem();
    const createdWarehouse = await createWarehouse(userMock);
    const updatedCity = "updatedCity";
    vi.setSystemTime(updatedNow);
    const updatedWarehouse = await updateWarehouse({
      ...createdWarehouse,
      city: updatedCity,
    });
    await deleteWarehouse(warehouseId);
    expect(updatedWarehouse).toMatchInlineSnapshot(`
      {
        "city": "updatedCity",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "updateWarehouseId",
      }
    `);
  });

  test("should throw an error is a warehouse does not exist", async () => {
    const result = await getError(async () =>
      updateWarehouse({
        ...createWarehouseSeed(),
        warehouseId: "unknownWarehouseId",
      })
    );
    expect(result).toMatchInlineSnapshot(
      '[Error: You cannot delete a warehouse that does not exist.]'
    );
  });
  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const error = await getError<WarehouseError>(async () =>
      updateWarehouse({
        ...createWarehouseSeed(),
        warehouseId: "",
      })
    );
    expect(error).toMatchInlineSnapshot('[Error: Warehouse updates must return all attributes of the item.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      updateWarehouse({
        ...createWarehouseSeed(),
        warehouseId: "",
      })
    );

    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("deleteWarehouse", () => {
  test("should delete a warehouse", async () => {
    const warehouseId = "deleteWarehouseId";
    mockedUlid.mockReturnValue(warehouseId);
    const userMock = new WarehouseItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      userId: TEST_USER_ID,
      city: "New York",
      updatedAt: "2021-01-01T00:00:00.000Z",
      warehouseId: "warehouseId",
    }).toItem();
    await createWarehouse(userMock);
    const deletedWarehouse = await deleteWarehouse(warehouseId);
    expect(deletedWarehouse).toMatchInlineSnapshot(`
      {
        "city": "New York",
        "createdAt": "2022-12-01T00:00:00.000Z",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "deleteWarehouseId",
      }
    `);
  });
  test("should return an error when trying to delete a warehouse that does not exist", async () => {
    const error = await getError(async () =>
      deleteWarehouse("doesntExistWarehouseId")
    );
    expect(error).toMatchInlineSnapshot('[Error: You cannot delete a warehouse that does not exist.]');
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      deleteWarehouse("doesntExistWarehouseId")
    );
    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});
