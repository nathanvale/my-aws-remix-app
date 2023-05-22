/* eslint-disable jest/no-disabled-tests */
import {
	createNote,
	deleteNote,
	readNote,
	getNoteListItems,
	NoteItem,
} from '../note.server'
import ulid from 'ulid'
import { vi } from 'vitest'
import { TEST_NOTE_ID, TEST_USER_ID } from 'dynamodb/db-test-helpers'
describe.skip('Skip for now...', () => {
	describe('NoteItem', () => {
		test('should get a DynamoDB attribute map of a note', async () => {
			const note = new NoteItem({
				title: '',
				userId: TEST_USER_ID,
				noteId: TEST_NOTE_ID,
			}).toDynamoDBItem()
			expect(note).toMatchInlineSnapshot(`
      {
        "Attributes": {
          "M": {
            "body": {
              "S": "",
            },
            "noteId": {
              "S": "12345",
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
        "PK": {
          "S": "USER#12345",
        },
        "SK": {
          "S": "NOTE#12345",
        },
      }
    `)
		})
	})

	describe('createNote', () => {
		test('should create a note', async () => {
			const noteId = 'newNoteId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(noteId)
			const note = await createNote({
				title: 'New note',
				userId: TEST_USER_ID,
				body: 'Body',
			})
			deleteNote(TEST_USER_ID, noteId)
			expect(note).toMatchInlineSnapshot(`
      {
        "body": "Body",
        "noteId": "newNoteId",
        "title": "New note",
        "userId": "12345",
      }
    `)
		})
	})

	describe('readNote', () => {
		test('should read a note', async () => {
			const note = await readNote(TEST_USER_ID, TEST_NOTE_ID)
			expect(note).toMatchInlineSnapshot(`
      NoteItem {
        "attributes": {
          "body": "Body",
          "noteId": "12345",
          "title": "Title",
          "userId": "12345",
        },
      }
    `)
		})
	})

	describe('deleteNote', () => {
		test('should delete a note', async () => {
			const noteId = 'deletedNoteId'
			vi.spyOn(ulid, 'ulid').mockReturnValue(noteId)
			await createNote({
				title: 'Title',
				userId: TEST_USER_ID,
			})
			const deletedNote = await deleteNote(TEST_USER_ID, noteId)
			expect(deletedNote).toMatchInlineSnapshot(`
        {
          "body": "",
          "noteId": "deletedNoteId",
          "title": "Title",
          "userId": "12345",
        }
      `)
		})
	})

	describe('getNoteListItems', () => {
		test('should get notes for a userId', async () => {
			const notes = await getNoteListItems(TEST_USER_ID)
			expect(notes).toMatchInlineSnapshot(`
      [
        {
          "body": "Body",
          "noteId": "12345",
          "title": "Title",
          "userId": "12345",
        },
      ]
    `)
		})
	})
})
