import bcrypt from "bcryptjs";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  readUser,
  updateUser,
  User,
  UserItem,
  verifyEmailNotExist,
  verifyLogin,
} from "../user.server";
import { ulid } from "ulid";
import { UserError } from "../errors";
import {
  clientApiMethodReject,
  clientApiMethodResolve,
  TEST_USER_EMAIL,
  TEST_USER_ID,
} from "../../../../test/db-test-helpers";
import * as client from "../../client";
import * as log from "../../log";
import { UnknownError } from "../../errors";
import { SpyInstance, Mock } from "vitest";

vi.mock("ulid");

let mockedUlid = ulid as Mock;
let compareSpy: SpyInstance;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(log, "logError").mockReturnValue("id");
  vi.spyOn(bcrypt, "hash").mockReturnValue("hashed-password" as any);
  compareSpy = vi.spyOn(bcrypt, "compare");
});

describe("NoteItem", () => {
  test("should get a DynamoDB attribute map of a user", async () => {
    const userItem = new UserItem({
      userId: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      password: "password",
    }).toDynamoDBItem();
    expect(userItem).toMatchInlineSnapshot(`
        {
          "Attributes": {
            "M": {
              "campaignCount": {
                "N": "0",
              },
              "email": {
                "S": "test@test.com",
              },
              "firstName": {
                "S": "",
              },
              "lastName": {
                "S": "",
              },
              "password": {
                "S": "password",
              },
              "userId": {
                "S": "12345",
              },
            },
          },
          "EntityType": {
            "S": "user",
          },
          "GS1PK": {
            "S": "USER#test@test.com",
          },
          "GS1SK": {
            "S": "USER#test@test.com",
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
            "S": "USER#12345",
          },
          "SK": {
            "S": "USER#12345",
          },
        }
      `);
  });
});

describe("createUser", () => {
  test("should create a user", async () => {
    const userId = "newUserId";
    mockedUlid.mockReturnValue(userId);
    const result = await createUser("new.user@test.com", "password");
    const user = result.val as User;
    await deleteUser(userId);
    expect(user).toMatchInlineSnapshot(`
        {
          "campaignCount": 0,
          "email": "new.user@test.com",
          "firstName": "",
          "lastName": "",
          "password": "hashed-password",
          "userId": "newUserId",
        }
      `);
  });
  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("putItem", new Error("Unknown error"))
    );
    const result = await createUser("new.user@test.com", "password");
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("readUser", () => {
  test("should read a user", async () => {
    const result = await readUser(TEST_USER_ID);
    const user = result.val as User;
    expect(user).toMatchInlineSnapshot(`
      {
        "campaignCount": 0,
        "email": "test@test.com",
        "firstName": "",
        "lastName": "",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "userId": "12345",
      }
    `);
  });

  test("should return an error when getting a user that does not exist", async () => {
    const result = await readUser("unknown.user@test.com");
    const error = result.val as UserError;
    expect(error).toMatchInlineSnapshot(`
        UserError {
          "code": "USER_NOT_FOUND",
          "id": "id",
          "message": "User not found.",
          "statusCode": 400,
        }
      `);
  });

  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("getItem", new Error("Unknown error"))
    );
    const result = await readUser(TEST_USER_ID);
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("updateUser", () => {
  test("should update a user", async () => {
    const userId = "updateUserId";
    mockedUlid.mockReturnValue(userId);
    const result1 = await createUser("update.user@test.com", "password");
    const user = result1.val as User;
    const result2 = await updateUser({
      ...user,
      firstName: "First",
      lastName: "Last",
    });
    const updatedNote = result2.val as User;
    await deleteUser(userId);
    expect(updatedNote).toMatchInlineSnapshot(`
        {
          "campaignCount": 0,
          "email": "update.user@test.com",
          "firstName": "First",
          "lastName": "Last",
          "password": "hashed-password",
          "userId": "updateUserId",
        }
      `);
  });

  test("should throw an error is a user does not exist", async () => {
    const result = await updateUser({
      email: "",
      userId: "unknownUserId",
      password: "",
    });

    expect(result.val).toMatchInlineSnapshot(`
      UserError {
        "code": "USER_DOES_NOT_EXIST",
        "id": "id",
        "message": "You cannot delete a user that does not exist.",
        "statusCode": 400,
      }
    `);
  });

  test("should throw an when an item update doesnt return values", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodResolve("updateItem", {})
    );
    const result = await updateUser({
      email: "",
      userId: "",
      password: "",
      firstName: "First",
      lastName: "Last",
    });
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UserError {
        "code": "USER_UPDATES_MUST_RETURN_VALUES",
        "id": "id",
        "message": "User updates must return all attributes of the item.",
        "statusCode": 500,
      }
    `);
  });

  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("updateItem", new Error("Unknown error"))
    );
    const result = await updateUser({
      email: "",
      userId: "",
      password: "",
      firstName: "First",
      lastName: "Last",
    });
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("deleteUser", () => {
  test("should delete a user", async () => {
    const userId = "deleteUserId";
    mockedUlid.mockReturnValue(userId);
    const email = "delete.me@test.com";
    await createUser(email, "password");
    const result = await deleteUser(userId);
    const deletedNote = result.val as User;
    expect(deletedNote).toMatchInlineSnapshot(`
        {
          "campaignCount": 0,
          "email": "delete.me@test.com",
          "firstName": "",
          "lastName": "",
          "password": "hashed-password",
          "userId": "deleteUserId",
        }
      `);
  });
  test("should return an error when trying to delete a user that does not exist", async () => {
    const userId = "deleteUserId";
    mockedUlid.mockReturnValue(userId);
    await createUser("delete.user@test.com", "password");
    const result = await deleteUser("doesntExistUserId");
    const error = result.val as UserError;
    await deleteUser(userId);
    expect(error).toMatchInlineSnapshot(`
        UserError {
          "code": "USER_DOES_NOT_EXIST",
          "id": "id",
          "message": "You cannot delete a user that does not exist.",
          "statusCode": 400,
        }
      `);
  });
  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("deleteItem", new Error("Unknown error"))
    );
    const result = await deleteUser("doesntExistUserId");
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("getUserByEmail", () => {
  test("should get get a user by email", async () => {
    const result = await getUserByEmail(TEST_USER_EMAIL);
    const user = result.val as any;
    expect(user).toMatchInlineSnapshot(`
      {
        "campaignCount": 0,
        "email": "test@test.com",
        "firstName": "",
        "lastName": "",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "userId": "12345",
      }
    `);
  });
  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("query", new Error("Unknown error"))
    );
    const result = await getUserByEmail(TEST_USER_EMAIL);
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("verifyEmailNotExist", () => {
  test("should verify that an email doesnt not exist", async () => {
    const result = await verifyEmailNotExist("doesnt.exist@test.com");
    expect(result.val).toMatchInlineSnapshot("true");
  });
  test("should return an error when a user already exists", async () => {
    const result = await verifyEmailNotExist(TEST_USER_EMAIL);
    expect(result.val).toMatchInlineSnapshot(`
      UserError {
        "code": "USER_ALREADY_EXISTS",
        "id": "id",
        "message": "There is already an existing user with this email address.",
        "statusCode": 400,
      }
    `);
  });
  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("query", new Error("Unknown error"))
    );
    const result = await verifyEmailNotExist("doesnt.exist@test.com");
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});

describe("verifyLogin", () => {
  test("should get an exisiting user", async () => {
    compareSpy.mockResolvedValue(true);
    const result = await verifyLogin(TEST_USER_EMAIL, "password");
    const user = result.val as User;
    expect(user).toMatchInlineSnapshot(`
      {
        "campaignCount": 0,
        "email": "test@test.com",
        "firstName": "",
        "lastName": "",
        "password": "$2a$12$9AW1GJShZ3fd42xjtWyaUeA6BIlLJOByxj9vV90Rnoa9I1iEjYwyq",
        "userId": "12345",
      }
    `);
  });

  test("should return an error when verifying a user that does not exist", async () => {
    const result = await verifyLogin("doesnt.exist@test.com", "password");
    const error = result.val as UserError;
    expect(error).toMatchInlineSnapshot(`
        UserError {
          "code": "USER_NOT_FOUND",
          "id": "id",
          "message": "User not found.",
          "statusCode": 400,
        }
      `);
  });

  test("should return an error when verifying a user with an invalid password", async () => {
    compareSpy.mockResolvedValue(false);
    const result = await verifyLogin(TEST_USER_EMAIL, "password");
    const error = result.val as UserError;
    expect(error).toMatchInlineSnapshot(`
        UserError {
          "code": "USER_PASSWORD_INVALID",
          "id": "id",
          "message": "Invalid pasword.",
          "statusCode": 400,
        }
      `);
  });
  test("should throw an unknown error", async () => {
    vi.spyOn(client, "getClient").mockResolvedValue(
      clientApiMethodReject("query", new Error("Unknown error"))
    );
    const result = await verifyLogin(TEST_USER_EMAIL, "password");
    const error = result.val as UnknownError;
    delete error.stack;
    expect(error).toMatchInlineSnapshot(`
      UnknownError {
        "code": "Error",
        "id": "id",
        "message": "Unknown error",
        "statusCode": 0,
      }
    `);
  });
});
