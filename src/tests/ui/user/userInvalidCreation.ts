import {
  test,
  expect,
  request as playwrightRequest,
  APIResponse,
  APIRequestContext,
  Page,
} from "@playwright/test";
import { URLS } from "../../../providers/urlProvider";
import { PageFactory } from "../../../pageFactory/pageFactory";
import { AddUserPage } from "../../../pages/user/addUserPage";
import { AddUserSteps } from "../../../steps/user/addUserSteps";
import { UserDto } from "../../../dto/UserDto";
import { UserApiClient } from "../../../api/userApiClient";
import { UserDtoResponse } from "../../../dto/UserDtoResponse";
import { UserSteps } from "../../../steps/user/userSteps";
import { GenericSteps } from "../../../steps/base/genericSteps";
import { GenderOptions } from "../../../enums/GenderOptions";
import { RandomGeneratorHelper } from "../../../helpers/randomGeneratorHelper";

let usersWithInvalidYearOfBirth: UserDto[] = [
  {
    name: RandomGeneratorHelper.generateRandomUserName(6),
    yearOfBirth: "1899",
    gender: GenderOptions.Male,
  },
  {
    name: RandomGeneratorHelper.generateRandomUserName(6),
    yearOfBirth: "1898",
    gender: GenderOptions.Male,
  },
  {
    name: RandomGeneratorHelper.generateRandomUserName(6),
    yearOfBirth: (new Date().getFullYear() - 17).toString(),
    gender: GenderOptions.Male,
  },
  {
    name: RandomGeneratorHelper.generateRandomUserName(6),
    yearOfBirth: (new Date().getFullYear() - 16).toString(),
    gender: GenderOptions.Male,
  },
];

let addUserPage: AddUserPage;
let addUserSteps: AddUserSteps;
let userApiClient: UserApiClient;
let genericSteps: GenericSteps;
let request: APIRequestContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
  request = await playwrightRequest.newContext();
  const context = await browser.newContext();
  page = await context.newPage();
});

test.beforeEach(async () => {
  const pageFactory: PageFactory = new PageFactory(page);

  genericSteps = new GenericSteps(page);
  addUserPage = pageFactory.getPage(AddUserPage);

  addUserSteps = new AddUserSteps(page);
  genericSteps.goToPage(URLS.ADD_USER);

  userApiClient = new UserApiClient(request);
});

test(`Check creation of user with empty fields @user @desktop @mobile`, async () => {
  await genericSteps.fillField(addUserPage.userNameField, "");
  await genericSteps.fillField(addUserPage.yearOfBirthField, "");
  await addUserPage.createBtn.click();

  await expect(addUserPage.page).toHaveURL(URLS.ADD_USER);
  expect(await addUserSteps.getUserNameFieldError()).toBe("Name is requried");
  expect(await addUserSteps.getYearOfBirthFieldError()).toBe(
    "Year of Birth is requried",
  );

  const responseForListAllUsers: APIResponse =
    await userApiClient.getUserList();
  const users: UserDtoResponse[] = await responseForListAllUsers.json();

  expect(UserSteps.isUserInList(new UserDto(), users)).toBe(false);
});

test(`Check creation of user with invalid 'User Name' input @user @desktop @mobile`, async () => {
  const testUser: UserDto = {
    name: RandomGeneratorHelper.generateRandomUserName(
      addUserPage.minUserNameLength - 1,
    ),
    yearOfBirth: "1900",
    gender: GenderOptions.Female,
  };

  await genericSteps.fillField(addUserPage.userNameField, testUser.name);
  await genericSteps.fillField(
    addUserPage.yearOfBirthField,
    testUser.yearOfBirth,
  );

  await addUserPage.createBtn.click();

  expect(await addUserSteps.getUserNameFieldError()).toBe("Name is too short");
  await expect(addUserPage.page).toHaveURL(URLS.ADD_USER);

  const responseForListAllUsers: APIResponse =
    await userApiClient.getUserList();
  const users: UserDtoResponse[] = await responseForListAllUsers.json();

  expect(UserSteps.isUserInList(testUser, users)).toBe(false);
});

usersWithInvalidYearOfBirth.forEach((userDTO) => {
  test(`Check creation of user with invalid 'Year of Birth': ${userDTO.yearOfBirth} @user @desktop @mobile`, async () => {
    await genericSteps.fillField(addUserPage.userNameField, userDTO.name);
    await genericSteps.fillField(
      addUserPage.yearOfBirthField,
      userDTO.yearOfBirth,
    );

    await addUserPage.createBtn.click();

    expect(await addUserSteps.getYearOfBirthFieldError()).toBe(
      "Not valid Year of Birth is set",
    );
    await expect(addUserPage.page).toHaveURL(URLS.ADD_USER);

    const responseForListAllUsers: APIResponse =
      await userApiClient.getUserList();
    const users: UserDtoResponse[] = await responseForListAllUsers.json();

    expect(UserSteps.isUserInList(userDTO, users)).toBe(false);
  });
});

test("Verify 'User Name' maximum symbols limit on the 'Add User' page @user @desktop @mobile", async () => {
  // checking maximum symbols limit - 14 characters for User Name input
  const testStr: string = RandomGeneratorHelper.generateRandomUserName(
    addUserPage.maxUserNameLength + 5,
  );
  await genericSteps.fillField(addUserPage.userNameField, testStr);
  await expect(addUserPage.userNameField).toHaveValue(
    testStr.substring(0, addUserPage.maxUserNameLength),
  );
});
