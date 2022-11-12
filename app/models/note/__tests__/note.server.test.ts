import {
  createNote,
  deleteNote,
  readNote,
  getNoteListItems,
  NoteItem,
} from "../note.server";
import { ulid } from "ulid";
import { Mock, vi } from "vitest";
import { TEST_USER_ID } from "../../../../test/db-test-helpers";

vi.mock("ulid");
const mockedUlid = ulid as Mock;

afterEach(() => {
  mockedUlid.mockReset();
});

describe("NoteItem", () => {
  test("should get a DynamoDB attribute map of a note", async () => {
    const note = new NoteItem({
      title: "",
      userId: TEST_USER_ID,
      noteId: "noteId",
    }).toDynamoDBItem();
    expect(note).toMatchInlineSnapshot(`
        {
          "Attributes": {
            "M": {
              "body": {
                "S": "",
              },
              "noteId": {
                "S": "noteId",
              },
              "title": {
                "S": "",
              },
              "userId": {
                "S": "12345",
              },
            },
          },
          "EntityType": {
            "S": "note",
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
            "S": "USER#12345",
          },
          "SK": {
            "S": "NOTE#noteId",
          },
        }
      `);
  });
});

describe("createNote", () => {
  test("should create a note", async () => {
    const createdNoteId = "newNoteId";
    mockedUlid.mockReturnValue(createdNoteId);
    const note = await createNote({
      title: "New note",
      userId: TEST_USER_ID,
      body: "Body",
    });
    deleteNote(TEST_USER_ID, createdNoteId);
    expect(note).toMatchInlineSnapshot(`
      {
        "body": "Body",
        "noteId": "newNoteId",
        "title": "New note",
        "userId": "12345",
      }
    `);
  });
});

describe("readNote", () => {
  test("should read a note", async () => {
    const note = await readNote(TEST_USER_ID, "1");
    expect(note).toMatchInlineSnapshot(`
        NoteItem {
          "attributes": {
            "body": "Body",
            "noteId": "1",
            "title": "Title",
            "userId": "12345",
          },
        }
      `);
  });
});

describe("deleteNote", () => {
  test("should delete a note", async () => {
    const ulid = "deletedNoteId";
    mockedUlid.mockReturnValue(ulid);
    await createNote({
      title: "Title",
      userId: TEST_USER_ID,
    });
    const deletedNote = await deleteNote(TEST_USER_ID, ulid);
    expect(deletedNote).toMatchInlineSnapshot(`
        {
          "body": "",
          "noteId": "deletedNoteId",
          "title": "Title",
          "userId": "12345",
        }
      `);
  });
});

describe("getNoteListItems", () => {
  test("should get notes for a userId", async () => {
    const notes = await getNoteListItems(TEST_USER_ID);
    expect(notes).toMatchInlineSnapshot(`
      [
        {
          "body": "Body",
          "noteId": "1",
          "title": "Title",
          "userId": "12345",
        },
      ]
    `);
  });
});
