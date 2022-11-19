import {
  marshall,
  unmarshall,
  checkForDBAttributes,
} from "../../../dynamodb/utils";

describe("marshall", () => {
  test("should convert a JavaScript object into a DynamoDB record", () => {
    expect(
      marshall({
        string: "foo",
        list: ["fizz", "buzz", "pop"],
        map: {
          nestedMap: {
            key: "value",
          },
        },
        number: 123,
        nullValue: null,
        boolValue: true,
      })
    ).toMatchInlineSnapshot(`
      {
        "boolValue": {
          "BOOL": true,
        },
        "list": {
          "L": [
            {
              "S": "fizz",
            },
            {
              "S": "buzz",
            },
            {
              "S": "pop",
            },
          ],
        },
        "map": {
          "M": {
            "nestedMap": {
              "M": {
                "key": {
                  "S": "value",
                },
              },
            },
          },
        },
        "nullValue": {
          "NULL": true,
        },
        "number": {
          "N": "123",
        },
        "string": {
          "S": "foo",
        },
      }
    `);
  });
});

describe("unmarshall", () => {
  test("should convert a record received from a DynamoDB stream", () => {
    expect(
      unmarshall({
        string: { S: "foo" },
        list: { L: [{ S: "fizz" }, { S: "buzz" }, { S: "pop" }] },
        map: {
          M: {
            nestedMap: {
              M: {
                key: { S: "value" },
              },
            },
          },
        },
        number: { N: "123" },
        nullValue: { NULL: true },
        boolValue: { BOOL: true },
      })
    ).toMatchInlineSnapshot(`
          {
            "boolValue": true,
            "list": [
              "fizz",
              "buzz",
              "pop",
            ],
            "map": {
              "nestedMap": {
                "key": "value",
              },
            },
            "nullValue": null,
            "number": 123,
            "string": "foo",
          }
        `);
  });
});

describe("checkForDBAttributes", () => {
  test("should throw an error if thre are missing data model attributes on a dynamoDB attribute map", () => {
    expect(() =>
      checkForDBAttributes({ a: "a" }, { b: { S: "b" } })
    ).toThrowError("Invariant failed: No item attributes.a!");
  });
});
