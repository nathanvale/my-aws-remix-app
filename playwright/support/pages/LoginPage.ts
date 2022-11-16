import { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly logInInput: Locator;
  readonly passwordInput: Locator;
  readonly logInButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signUpLink: Locator;

  constructor(readonly page: Page) {
    this.logInInput = page.getByRole("textbox", { name: /email/i });
    this.passwordInput = page.getByLabel(/password/i);
    this.logInButton = page.getByRole("button", { name: /log in/i });
    this.rememberMeCheckbox = page.getByRole("checkbox", {
      name: /remember me/i,
    });
    this.signUpLink = page.getByRole("link", { name: /sign up/i });
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(login: string, password: string) {
    await this.logInInput.fill(login);
    await this.passwordInput.fill(password);
    await this.logInButton.click();
  }
}
