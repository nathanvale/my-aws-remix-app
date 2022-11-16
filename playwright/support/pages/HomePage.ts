import { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly logInLink: Locator;
  readonly signUpLink: Locator;
  readonly viewNotesLink: Locator;

  constructor(readonly page: Page) {
    this.logInLink = page.getByRole("link", { name: /log in/i });
    this.signUpLink = page.getByRole("link", { name: /sign up/i });
    this.viewNotesLink = page.getByRole("link", {
      name: /notes/i,
    });
  }

  async goto() {
    await this.page.goto("/");
  }
}
