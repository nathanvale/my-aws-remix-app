import {
  createOrderItem,
  deleteOrderItem,
  readOrderItem,
  updateOrderItem,
  OrderItemItem,
} from "../order-item.server";
import { ulid } from "ulid";
import { OrderItemError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_ORDER_ID,
  TEST_ORDER_ITEM_ID,
  TEST_PRODUCT_ID,
} from "dynamodb/db-test-helpers";
import * as client from "dynamodb/client";
import * as log from "../../log";
import { createOrderItemSeed } from "dynamodb/seed-utils";
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

describe("OrderItemItem", () => {
  test("should get a DynamoDB attribute map of a order item", async () => {
    const productItem = new OrderItemItem({
      productId: TEST_PRODUCT_ID,
      createdAt: "2021-01-01T00:00:00.000Z",
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      orderItemId: TEST_ORDER_ITEM_ID,
      orderId: TEST_ORDER_ID,
    }).toDynamoDBItem();

    expect(productItem).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "createdAt": {
              "S": "2021-01-01T00:00:00.000Z",
            },
            "orderId": {
              "S": "12345",
            },
            "orderItemId": {
              "S": "12345",
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
          },
        },
        "EntityType": {
          "S": "orderItem",
        },
        "GS1PK": {
          "S": "PRODUCT#12345",
        },
        "GS1SK": {
          "S": "ORDER#12345",
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
          "S": "ORDER#12345",
        },
        "SK": {
          "S": "ORDER_ITEM#12345",
        },
      }
    `);
  });

  test("should get GSI attribute values", () => {
    const result = OrderItemItem.getGSIAttributeValues("productId", "orderId");
    expect(result).toMatchInlineSnapshot(`
      {
        "GS1PK": {
          "S": "PRODUCT#productId",
        },
        "GS1SK": {
          "S": "ORDER#orderId",
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

describe("createOrderItem", () => {
  test("should create a order item", async () => {
    const orderItemId = "newOrderItemId";
    mockedUlid.mockReturnValue(orderItemId);
    const userMock = new OrderItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      orderId: TEST_ORDER_ID,
      orderItemId,
    }).toItem();
    const createdUser = await createOrderItem(userMock);
    await deleteOrderItem(TEST_ORDER_ID, orderItemId);
    expect(createdUser).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "orderItemId": "newOrderItemId",
        "productId": "12345",
        "quantity": "1",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `);
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      createOrderItem(createOrderItemSeed())
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("readOrderItem", () => {
  test("should read a order item", async () => {
    const result = await readOrderItem(TEST_ORDER_ITEM_ID, TEST_PRODUCT_ID);
    expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": "2021-01-01T00:00:00.000Z",
        "orderId": "12345",
        "orderItemId": "12345",
        "productId": "12345",
        "quantity": "1",
        "updatedAt": "2021-01-01T00:00:00.000Z",
      }
    `);
  });

  test("should return an error when getting a order item that does not exist", async () => {
    const result = await getError(async () =>
      readOrderItem("unknownOrderItemId", TEST_PRODUCT_ID)
    );
    expect(result).toMatchInlineSnapshot('[Error: Order item not found.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await getError<Error>(async () =>
      readOrderItem(TEST_ORDER_ITEM_ID, TEST_PRODUCT_ID)
    );
    delete result.stack;
    expect(result).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("updateOrderItem", () => {
  test("should update a orderItem item", async () => {
    const orderItemId = "updateOrderItemId";
    mockedUlid.mockReturnValue(orderItemId);
    const userMock = new OrderItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      orderId: TEST_ORDER_ID,
      orderItemId,
    }).toItem();
    const createdOrderItem = await createOrderItem(userMock);
    const quantity = "updatedQuantity";
    vi.setSystemTime(updatedNow);
    const updatedOrderItem = await updateOrderItem({
      ...createdOrderItem,
      quantity,
    });
    await deleteOrderItem(TEST_ORDER_ID, orderItemId);
    expect(updatedOrderItem).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "orderItemId": "updateOrderItemId",
        "productId": "12345",
        "quantity": "updatedQuantity",
        "updatedAt": "2022-12-05T00:00:00.000Z",
      }
    `);
  });

  test("should throw an error is a order item does not exist", async () => {
    const result = await getError(async () =>
      updateOrderItem({
        ...createOrderItemSeed(),
        orderItemId: "unknownOrderItemId",
      })
    );
    expect(result).toMatchInlineSnapshot('[Error: You cannot delete a order item that does not exist.]');
  });
  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const error = await getError<OrderItemError>(async () =>
      updateOrderItem({
        ...createOrderItemSeed(),
        orderItemId: "",
      })
    );
    expect(error).toMatchInlineSnapshot('[Error: Order item updates must return all attributes of the item.]');
  });

  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      updateOrderItem({
        ...createOrderItemSeed(),
        orderItemId: "",
      })
    );

    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});

describe("deleteOrderItem", () => {
  test("should delete a order item", async () => {
    const orderItemId = "deleteOrderItemId";
    mockedUlid.mockReturnValue(orderItemId);
    const userMock = new OrderItemItem({
      createdAt: "2021-01-01T00:00:00.000Z",
      productId: TEST_PRODUCT_ID,
      quantity: "1",
      updatedAt: "2021-01-01T00:00:00.000Z",
      orderId: TEST_ORDER_ID,
      orderItemId,
    }).toItem();
    await createOrderItem(userMock);
    const deletedOrderItem = await deleteOrderItem(TEST_ORDER_ID, orderItemId);
    expect(deletedOrderItem).toMatchInlineSnapshot(`
      {
        "createdAt": "2022-12-01T00:00:00.000Z",
        "orderId": "12345",
        "orderItemId": "deleteOrderItemId",
        "productId": "12345",
        "quantity": "1",
        "updatedAt": "2022-12-01T00:00:00.000Z",
      }
    `);
  });
  test("should return an error when trying to delete a order item that does not exist", async () => {
    const error = await getError(async () =>
      deleteOrderItem(TEST_ORDER_ID, "doesntExistOrderItemId")
    );
    expect(error).toMatchInlineSnapshot('[Error: You cannot delete a order item that does not exist.]');
  });
  test("should throw an error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const error = await getError<Error>(async () =>
      deleteOrderItem(TEST_ORDER_ID, "doesntExistOrderItemId")
    );
    delete error.stack;
    expect(error).toMatchInlineSnapshot("[Error: Unknown error]");
  });
});
