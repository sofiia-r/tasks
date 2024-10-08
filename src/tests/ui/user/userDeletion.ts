import {
  test,
  expect,
  request as playwrightRequest,
  APIResponse,
  APIRequestContext,
  Page,
} from "@playwright/test";
import { GenderOptions } from "../../../enums/GenderOptions";
import { PageFactory } from "../../../pageFactory/pageFactory";
import { DeleteUserPage } from "../../../pages/user/deleteUserPage";
import { HomeSteps } from "../../../steps/homeSteps";
import { UserDto } from "../../../dto/UserDto";
import { UserDtoResponse } from "../../../dto/UserDtoResponse";
import { UserApiClient } from "../../../api/userApiClient";
import { GenericSteps } from "../../../steps/base/genericSteps";
import { UserSteps } from "../../../steps/user/userSteps";
import { RandomGeneratorHelper } from "../../../helpers/randomGeneratorHelper";
import { URLS } from "../../../providers/urlProvider";

let userDto: UserDto;
let deleteUserPage: DeleteUserPage;
let homeSteps: HomeSteps;
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
  userDto = {
    name: RandomGeneratorHelper.generateRandomUserName(
      RandomGeneratorHelper.generateRandomNumber(3, 14),
    ),
    yearOfBirth: "1956",
    gender: GenderOptions.Undefined,
  };

  userApiClient = new UserApiClient(request);
  const response = await userApiClient.createUser(userDto);

  const pageFactory: PageFactory = new PageFactory(page);
  deleteUserPage = pageFactory.getPage(DeleteUserPage);

  homeSteps = new HomeSteps(page);
  genericSteps = new GenericSteps(page);

  await genericSteps.goToPage(URLS.HOME_PAGE);
});

test(`Check successful deletion of a user @user @desktop @mobile`, async () => {
  await homeSteps.clickDeleteUserBtn(userDto.name);
  await deleteUserPage.yesBtn.click();

  const responseForListAllUsers: APIResponse =
    await userApiClient.getUserList();
  const users: UserDtoResponse[] = await responseForListAllUsers.json();

  expect(UserSteps.isUserInList(userDto, users)).toBe(false);
});
