import { Locator, Page } from '@playwright/test'

export class NotesPage {
	readonly newNoteLink: Locator
	readonly logoutButton: Locator
	readonly titleInput: Locator
	readonly bodyInput: Locator
	readonly saveButton: Locator
	readonly deleteButton: Locator
	readonly noNotesYetTest: Locator

	constructor(readonly page: Page) {
		this.newNoteLink = page.getByRole('link', { name: /\+ new note/i })
		this.logoutButton = page.getByRole('button', { name: /logout/i })
		this.titleInput = page.getByRole('textbox', { name: /title/i })
		this.bodyInput = page.getByRole('textbox', { name: /body/i })
		this.saveButton = page.getByRole('button', { name: /save/i })
		this.deleteButton = page.getByRole('button', { name: /delete/i })
		this.noNotesYetTest = page.getByText('No notes yet')
	}

	async goto() {
		await this.page.goto('/')
	}
}
