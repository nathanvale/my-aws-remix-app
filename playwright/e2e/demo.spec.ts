import { faker } from "@faker-js/faker";
import { HomePage } from "playwright/support/pages/HomePage";
import { JoinPage } from "playwright/support/pages/JoinPage";
import { NotesPage } from "playwright/support/pages/NotesPage";
import {
  test,
  expect,
  makeLoginForm,
  deleteUserByEmail,
  loginPage,
} from "../fixtures";

test.describe("Smoke Tests", () => {
  test.describe("Authentication", () => {
    test("should allow you to register and login", async ({ page }) => {
      const loginForm = makeLoginForm();
      const joinPage = new JoinPage(page);
      await joinPage.goto();
      await joinPage.join(loginForm.email, loginForm.password);
      const homePage = new HomePage(page);
      await homePage.viewNotesLink.click();
      const notesPage = new NotesPage(page);
      await notesPage.logoutButton.click();
      await expect(homePage.logInLink).toBeVisible();
      await deleteUserByEmail(loginForm.email);
    });
  });

  test.describe("Notes", () => {
    test("should allow you to make a note", async ({ page, baseURL }) => {
      const user = await loginPage({ page, baseURL });
      const homePage = new HomePage(page);
      await homePage.goto();
      await homePage.viewNotesLink.click();
      const notesPage = new NotesPage(page);
      await notesPage.newNoteLink.click();
      await notesPage.titleInput.click();
      await notesPage.titleInput.type(faker.lorem.words(1));
      await notesPage.bodyInput.click();
      await notesPage.bodyInput.type(faker.lorem.sentences(1));
      await notesPage.saveButton.click();
      await notesPage.deleteButton.click();
      await expect(notesPage.noNotesYetTest).toBeVisible();
      await deleteUserByEmail(user.email);
    });
  });
});
