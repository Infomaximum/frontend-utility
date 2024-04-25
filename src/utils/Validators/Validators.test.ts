import {
  notEmptyMemoize,
  notEmptyTimepickersWithoutMessage,
  isValidTimepickersWithoutMessage,
  notEmptyMemoizeWithoutMessage,
  notEmptyMemoizeWithCustomMessage,
  isValidEmailMemoize,
  isValidEmailAndNotEmptyMemoize,
} from "./Validators";
import { Localization } from "@infomaximum/localization";
import { ENTER_CORRECT_EMAIL, FIELD_EMPTY } from "../../const/utilsLoc";
import { TestIdsUtils } from "../../const/TestIds";

const enLocalization = new Localization({ language: Localization.Language.en });
const ruLocalization = new Localization({ language: Localization.Language.ru });
const notEmptyFieldLoc = FIELD_EMPTY;
const isValidEmailLoc = ENTER_CORRECT_EMAIL;

// todo: отрефакторить передачу параметров allValues и meta в тестах
describe("Тест файла Validators", () => {
  const errObjForEmptyField = { code: TestIdsUtils.FIELD_EMPTY };

  test.each`
    value        | expected
    ${null}      | ${errObjForEmptyField}
    ${undefined} | ${errObjForEmptyField}
    ${[]}        | ${errObjForEmptyField}
    ${{}}        | ${errObjForEmptyField}
    ${""}        | ${errObjForEmptyField}
    ${"qwerty"}  | ${undefined}
    ${12}        | ${undefined}
    ${[1, 2]}    | ${undefined}
    ${{ a: 1 }}  | ${undefined}
  `(
    "Тестирование функции notEmptyMemoizeWithoutMessage(value = $value)",
    ({ value, expected }) => {
      expect(notEmptyMemoizeWithoutMessage(value, {})).toStrictEqual(expected);
    },
  );

  test.each`
    value                               | expected
    ${null}                             | ${errObjForEmptyField}
    ${undefined}                        | ${errObjForEmptyField}
    ${[]}                               | ${errObjForEmptyField}
    ${{}}                               | ${errObjForEmptyField}
    ${{ a: 1 }}                         | ${errObjForEmptyField}
    ${""}                               | ${errObjForEmptyField}
    ${"qwerty"}                         | ${errObjForEmptyField}
    ${[1, 2]}                           | ${errObjForEmptyField}
    ${{ begin: "12:00", end: "13:00" }} | ${undefined}
  `(
    "Тестирование функции notEmptyTimepickersWithoutMessage(value = $value)",
    ({ value, expected }) => {
      expect(notEmptyTimepickersWithoutMessage(value, {})).toStrictEqual(
        expected,
      );
    },
  );

  it("Тестирование функции isValidTimepickersWithoutMessage", () => {
    const timepickerData = {
      begin: { hour: 10, minute: 4, second: 10 },
      end: { hour: 12, minute: 4, second: 10 },
    };

    const incorrectTimepickerData = {
      begin: { hour: 10, minute: 4, second: 10 },
      end: { hour: 9, minute: 4, second: 10 },
    };

    expect(isValidTimepickersWithoutMessage(timepickerData, {})).toStrictEqual(
      undefined,
    );
    expect(
      isValidTimepickersWithoutMessage(incorrectTimepickerData, {}),
    ).toStrictEqual(errObjForEmptyField);
  });

  it("Тестирование функции notEmptyMemoize", () => {
    const selector = notEmptyMemoize(ruLocalization);

    expect(selector([], {})).toStrictEqual({
      message: notEmptyFieldLoc.ru,
      code: TestIdsUtils.FIELD_EMPTY,
    });
    expect(selector("test", {})).toBeUndefined();
  });

  it("Тестирование функции notEmptyMemoizeWithCustomMessage", () => {
    const selector = notEmptyMemoizeWithCustomMessage(enLocalization, {
      en: "some message",
      ru: "сообщение",
    });

    expect(selector(null, {})).toStrictEqual({
      message: "some message",
      code: TestIdsUtils.FIELD_EMPTY,
    });
    expect(selector("test", {})).toBeUndefined();
  });

  it("Тестирование функции isValidEmailMemoize", () => {
    const selector = isValidEmailMemoize(ruLocalization);
    const incorrectValue = "test";
    const correctValue = "test@test";
    const allValues = {};
    const meta: any = {};

    expect(selector(correctValue, allValues, meta)).toStrictEqual(undefined);
    expect(selector(incorrectValue, allValues, meta)).toStrictEqual({
      message: isValidEmailLoc.ru,
      code: TestIdsUtils.ENTER_CORRECT_EMAIL,
    });
  });

  it("Тестирование функции isValidEmailAndNotEmptyMemoize", () => {
    const selector = isValidEmailAndNotEmptyMemoize(ruLocalization);
    const incorrectValue = "test";
    const correctValue = "test@test";
    const allValues = {};
    const meta: any = {};

    expect(selector(correctValue, allValues, meta)).toStrictEqual(undefined);
    expect(selector(incorrectValue, allValues, meta)).toStrictEqual({
      message: isValidEmailLoc.ru,
      code: TestIdsUtils.ENTER_CORRECT_EMAIL,
    });
  });
});
