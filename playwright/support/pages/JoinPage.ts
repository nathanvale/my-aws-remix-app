import { Locator, Page } from "@playwright/test";

export class JoinPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page.getByRole("textbox", { name: /email/i });
    this.passwordInput = page.getByLabel(/password/i);
    this.signInButton = page.getByRole("button", { name: /create account/i });
  }

  async goto() {
    await this.page.goto("/join");
  }

  async join(login: string, password: string) {
    await this.emailInput.click();
    await this.emailInput.fill(login);
    await this.passwordInput.click();
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
