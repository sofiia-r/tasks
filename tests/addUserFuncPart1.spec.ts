import { test, expect } from "@playwright/test";
import { GenderOptions } from "../enums/GenderOptions";
import { PageFactory } from "../pageFactory/pageFactory";
import { AddUserPage } from "../pages/addUserPage";
import { HomePage } from "../pages/homePage";
import { DeleteUserPage } from "../pages/deleteUserPage";
import { URLS } from "../config/urlProvider";
import { AddUserSteps } from "../steps/addUserSteps";
import { HomeSteps } from "../steps/homeSteps";
import { UserDto } from "../dto/userDto";


const validUserData: UserDto[] = [
  new UserDto("nб3-w", "1900", GenderOptions.Undefined),
  new UserDto("йцу", "2005", GenderOptions.Male),
  new UserDto("new user", "2004", GenderOptions.Female),
  // TODO: uncomment after bugfix:
  // 'The User with Year of Birth 2006 is considered underage'
  // Bug report - https://requirements-trainee.atlassian.net/browse/KAN-1
  /* 
   new UserDTO("adult test", (new Date().getFullYear()-18).toString(), GenderOptions[0]),
  */
];

let addUserPage: AddUserPage, deleteUserPage: DeleteUserPage;
let addUserSteps: AddUserSteps, homeSteps: HomeSteps;

test.beforeEach(async ({ page }) => {
  const pageFactory: PageFactory = new PageFactory(page);

  addUserPage = pageFactory.getAddUserPage();
  deleteUserPage = pageFactory.getDeleteUserPage();
  addUserSteps = new AddUserSteps(page);
  homeSteps = new HomeSteps(page);

  addUserSteps.goToPage(URLS.ADD_USER);
});

validUserData.forEach((userDTO) => {
  test(`Check successful creation of new user "${userDTO.name}"`, async () => {
    await addUserSteps.selectGenderOption(userDTO.gender);
    await addUserSteps.fillField(
      userDTO.name,
      addUserPage.userNameField,
    );
    await addUserSteps.fillField(
      userDTO.yearOfBirth,
      addUserPage.yearOfBirthField,
    );

    await addUserPage.createBtn.click();

    expect(await homeSteps.getYearOfBirthOfUser(userDTO.name)).toBe(
      userDTO.yearOfBirth,
    );
    expect(await homeSteps.getSelectedGenderOfUser(userDTO.name)).toBe(
      GenderOptions[userDTO.gender],
    );

    await homeSteps.clickDeleteUserBtn(userDTO.name);
    await deleteUserPage.yesBtn.click();
  });
});
