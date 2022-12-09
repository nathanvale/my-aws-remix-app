import {
  createOrder,
  deleteOrder,
  readOrder,
  updateOrder,
  OrderItem,
} from "../order.server";
import { ulid } from "ulid";
import { OrderError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_ORDER_ID,
  TEST_USER_ID,
  TEST_WAREHOUSE_ID,
} from "dynamodb/db-test-helpers";
import * as client from "dynamodb/client";
import * as log from "../../log";
import { createOrderSeed } from "dynamodb/seed-utils";
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

describe("OrderItem", () => {
  test("should get a DynamoDB attribute map of a order", async () => {
    const orderItem = new OrderItem({
      createdAt: "2021-08-01T00:00:00.000Z",
      updatedAt: "2021-08-01T00:00:00.000Z",
      orderId: TEST_ORDER_ID,
      warehouseId: TEST_WAREHOUSE_ID,
      userId: TEST_USER_ID,
    }).toDynamoDBItem();
    expect(orderItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "createdAt": {
              "S": "2021-08-01T00:00:00.000Z",
            },
            "orderId": {
              "S": "12345",
            },
            "updatedAt": {
              "S": "2021-08-01T00:00:00.000Z",
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
          "S": "order",
        },
        "GS1PK": {
          "S": "WAREHOUSE#12345",
        },
        "GS1SK": {
          "S": "ORDER#2021-08-01T00:00:00.000Z",
        },
        "GS2PK": {
          "S": "USER#12345",
        },
        "GS2SK": {
          "S": "ORDER#2021-08-01T00:00:00.000Z",
        },
        "GS3PK": {
          "S": "",
        },
        "GS3SK": {
          "S": "",
        },
        "PK": {
          "S": "ORDER#12345",
        },
        "SK": {
          "S": "ORDER#12345",
        },
      }
    `);
  });
});

describe("createOrder", () => {
  test("should create a order", async () => {
    const orderId = "newOrderId";
    mockedUlid.mockReturnValue(orderId);
    const userMock = new OrderItem({
      createdAt: "2021-08-01T00:00:00.000Z",
      updatedAt: "2021-08-01T00:00:00.000Z",
      warehouseId: TEST_WAREHOUSE_ID,
      orderId: orderId,
      userId: TEST_USER_ID,
    }).toItem();
    const createdUser = await createOrder(userMock);
    await deleteOrder(orderId);
    expect(createdUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "newOrderId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "12345",
      }
    `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      createOrder(createOrderSeed())
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("readOrder", () => {
  test("should read a order", async () => {
    const result = await readOrder(TEST_ORDER_ID);
    expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-08-31T05:46:41.205Z",
        "orderId": "12345",
        "updatedAt": "2022-11-25T13:45:46.999Z",
        "userId": "12345",
        "warehouseId": "12345",
      }
    `);
  });

  test("should return an error when getting a order that does not exist", async () => {
    const result = await getError(async () => readOrder("unknownOrderId"));
    expect(result).toMatchInlineSnapshot(`
        OrderError {
          "code": "ORDER_NOT_FOUND",
          "id": "id",
          "message": "Order not found.",
          "statusCode": 400,
        }
      `);
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () => readOrder(TEST_ORDER_ID));
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("updateOrder", () => {
  test("should update a order", async () => {
    const orderId = "updateOrderId";
    mockedUlid.mockReturnValue(orderId);
    const userMock = new OrderItem({
      createdAt: "2021-08-01T00:00:00.000Z",
      updatedAt: "2021-08-01T00:00:00.000Z",
      warehouseId: TEST_WAREHOUSE_ID,
      orderId: orderId,
      userId: TEST_USER_ID,
    }).toItem();
    const createdOrder = await createOrder(userMock);
    const updatedWarehouseId = "updatedWarehouseId";
    vi.setSystemTime(updatedNow);
    const updatedOrder = await updateOrder({
      ...createdOrder,
      warehouseId: updatedWarehouseId,
    });
    await deleteOrder(orderId);
    expect(updatedOrder).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "updateOrderId",
        "updatedAt": "2022-12-05T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "updatedWarehouseId",
      }
    `);
  });

  test("should throw an error is a order does not exist", async () => {
    const result = await getError(async () =>
      updateOrder({
        ...createOrderSeed(),
        orderId: "unknownOrderId",
      })
    );
    expect(result).toMatchInlineSnapshot(`
      OrderError {
        "code": "ORDER_DOES_NOT_EXIST",
        "id": "id",
        "message": "You cannot delete a order that does not exist.",
        "statusCode": 400,
      }
    `);
  });
  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const error = await getError<OrderError>(async () =>
      updateOrder({
        ...createOrderSeed(),
        orderId: "",
      })
    );
    expect(error).toMatchInlineSnapshot(`
      OrderError {
        "code": "ORDER_UPDATES_MUST_RETURN_VALUES",
        "id": "id",
        "message": "Order updates must return all attributes of the item.",
        "statusCode": 500,
      }
    `);
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      updateOrder({
        ...createOrderSeed(),
        orderId: "",
      })
    );

    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("deleteOrder", () => {
  test("should delete a order", async () => {
    const orderId = "deleteOrderId";
    mockedUlid.mockReturnValue(orderId);
    const userMock = new OrderItem({
      createdAt: "2021-08-01T00:00:00.000Z",
      updatedAt: "2021-08-01T00:00:00.000Z",
      warehouseId: TEST_WAREHOUSE_ID,
      orderId: orderId,
      userId: TEST_USER_ID,
    }).toItem();
    await createOrder(userMock);
    const deletedOrder = await deleteOrder(orderId);
    expect(deletedOrder).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "deleteOrderId",
        "updatedAt": "2022-12-01T00:00:00.000Z",
        "userId": "12345",
        "warehouseId": "12345",
      }
    `);
  });
  test("should return an error when trying to delete a order that does not exist", async () => {
    const error = await getError(async () => deleteOrder("doesntExistOrderId"));
    expect(error).toMatchInlineSnapshot(`
        OrderError {
          "code": "ORDER_DOES_NOT_EXIST",
          "id": "id",
          "message": "You cannot delete a order that does not exist.",
          "statusCode": 400,
        }
      `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      deleteOrder("doesntExistOrderId")
    );
    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});
