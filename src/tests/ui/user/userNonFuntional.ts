import { test, expect, Locator, Page } from "@playwright/test";
import { Colors } from "../../../enums/Colors";
import { GenderOptions } from "../../../enums/GenderOptions";
import { PageFactory } from "../../../pageFactory/pageFactory";
import { AddUserPage } from "../../../pages/user/addUserPage";
import { URLS } from "../../../providers/urlProvider";
import { AddUserSteps } from "../../../steps/user/addUserSteps";
import { GenericSteps } from "../../../steps/base/genericSteps";

let addUserPage: AddUserPage;
let addUserSteps: AddUserSteps;
let genericSteps: GenericSteps;
let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
});

test.beforeEach(async () => {
  const pageFactory: PageFactory = new PageFactory(page);

  addUserPage = pageFactory.getPage(AddUserPage);
  addUserSteps = new AddUserSteps(page);
  genericSteps = new GenericSteps(page);

  await genericSteps.goToPage(URLS.ADD_USER);
});

test("Verify 'Create' button design on the 'Add User' page @user @desktop @mobile", async () => {
  const createBtn: Locator = addUserPage.createBtn;

  await expect(createBtn).toHaveCSS("background-color", Colors.lightBlue);
  await createBtn.hover();
  await expect(createBtn).toHaveCSS("background-color", Colors.darkBlue);
});

test("Verify 'Cancel' button design on the 'Add User' page @user @desktop @mobile", async () => {
  const cancelBtn: Locator = addUserPage.cancelBtn;

  await expect(cancelBtn).toHaveCSS("background-color", Colors.lightGrey);
  await cancelBtn.hover();
  await expect(cancelBtn).toHaveCSS("background-color", Colors.darkGrey);
});

test("Verify 'User Name' field placeholder on the 'Add User' page @user @desktop @mobile", async () => {
  const placeholder: string | null =
    await addUserPage.userNameField.getAttribute("placeholder");

  await expect(addUserPage.userNameField).toBeVisible();
  expect(placeholder).toEqual("User Name");
  await expect(addUserPage.userNameField).toHaveValue("");
});

test("Verify 'Year of Birth' field placeholder and only number input on the 'Add User' page @user @desktop @mobile", async () => {
  await expect(addUserPage.yearOfBirthField).toBeVisible();
  await expect(addUserPage.yearOfBirthField).toHaveValue("");
  const placeholder: string | null =
    await addUserPage.yearOfBirthField.getAttribute("placeholder");
  expect(placeholder).toEqual("Year of Birth");

  // check that non-number input is ignored by the Year of Birth field
  await addUserPage.yearOfBirthField.click();
  await addUserPage.page.keyboard.insertText("!a@");
  await expect(addUserPage.yearOfBirthField).toHaveValue("");
});

test("Check 'Gender' field content on the 'Add User' page @user @desktop @mobile", async () => {
  await expect(addUserPage.genderField).toBeVisible();

  await genericSteps.selectOption(addUserPage.genderField, GenderOptions.Male);
  expect(await addUserSteps.getGenderSelectedOption()).toBe(
    GenderOptions[GenderOptions.Male],
  );

  await genericSteps.selectOption(
    addUserPage.genderField,
    GenderOptions.Female,
  );
  expect(await addUserSteps.getGenderSelectedOption()).toBe(
    GenderOptions[GenderOptions.Female],
  );

  await genericSteps.selectOption(
    addUserPage.genderField,
    GenderOptions.Undefined,
  );
  expect(await addUserSteps.getGenderSelectedOption()).toBe(
    GenderOptions[GenderOptions.Undefined],
  );
});

// this test was used to practice writing tests with XPath functions and axis
test.skip("Verify Header content on the 'Add User' page @desktop", async () => {
  // checking the content of the first listitem of the header
  let listitem = page.locator("xpath=//ul/li[position()<2]/child::a");
  await expect(listitem).toHaveText("Home");
  await expect(listitem).toHaveAttribute("href", "/");

  // checking the content of the second listitem of the header
  listitem = listitem.locator(
    "xpath=/parent::li/following-sibling::li[1]/descendant::a",
  );
  await expect(listitem).toHaveText("Add User");
  await expect(listitem).toHaveAttribute("href", URLS.ADD_USER);

  // checking the content of last listitem of the header
  listitem = listitem.locator(
    'xpath=ancestor::ul/descendant::a[contains(text(),"Add Address")]',
  );
  await expect(listitem).toHaveText("Add Address");
  await expect(listitem).toHaveAttribute("href", URLS.ADD_ADDRESS);
});
