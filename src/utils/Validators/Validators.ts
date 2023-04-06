import isEmpty from "lodash/isEmpty";
import each from "lodash/each";
import isObject from "lodash/isObject";
import { createSelector } from "reselect";
import { ENTER_CORRECT_EMAIL, FIELD_EMPTY } from "../../const/utilsLoc";
import type {
  Localization,
  TLocalizationDescription,
} from "@infomaximum/localization";
import { SecondsPerHour, SecondsPerMinute } from "../../const";
import { TestIdsUtils } from "../../const/TestIds";
import { Model } from "@infomaximum/graphql-model";

type FieldValidator<FieldValue> = (
  value: FieldValue,
  allValues: object,
  meta?: any
) => any | Promise<any>;

export type TValidationError = {
  code: string;
  message?: string;
};

export type TFieldValidatorSelector<FV = any> = (
  ...args: any[]
) => FieldValidator<FV>;

const emailRegexp = new RegExp(".+@.+");
const messageDivider = ". ";
const codeDivider = "_and_";

const notEmptyFieldLoc = FIELD_EMPTY;
const isValidEmailLoc = ENTER_CORRECT_EMAIL;

/**
 * Селектор, проверяющий поочередно значение по массиву валидаторов, переданных ему и
 * возвращающий результат. Проверка останавливается на первом, возвратившем ошибку, валидаторе.
 * @returns error | undefined
 */
export const alternatelyValidators = (
  validators: FieldValidator<any>[]
): FieldValidator<any> => {
  return (value, allValues, meta) => {
    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];

      const error = validator?.(value, allValues, meta);

      if (error) {
        return error;
      }
    }
  };
};

/**
 * Селектор, проверяющий значение по массиву валидаторов, переданных ему и
 * возвращающий результат всех валидаций
 * @returns error | undefined
 */
export const combineValidators = (validators: TFieldValidatorSelector[]) =>
  createSelector(
    (locale: Localization) => locale,
    (locale: Localization, arg1?: any) => arg1,
    (locale: Localization, arg1?: any, arg2?: any) => arg2,
    (locale: Localization, arg1?: any, arg2?: any, arg3?: any) => arg3,
    (
      locale: Localization,
      arg1?: any,
      arg2?: any,
      arg3?: any
    ): FieldValidator<any> => {
      const localizedValidators = validators?.map((validator) =>
        validator(locale, arg1, arg2, arg3)
      );

      return (value, allValues, meta) => {
        let resultMessage = "";
        let resultCode = "";
        let resultedErrorsCount = 0;
        each(localizedValidators, (validator) => {
          const validateResult = validator(value, allValues, meta);
          if (validateResult) {
            resultedErrorsCount += 1;
            resultMessage += validateResult.message + messageDivider;
            resultCode += validateResult.code + codeDivider;
          }
        });

        if (resultedErrorsCount === 1) {
          resultMessage = resultMessage.slice(0, resultMessage.length - 2);
          resultCode = resultCode.slice(0, resultCode.length - 5);
        }

        if (resultMessage && resultCode) {
          return {
            message: resultMessage,
            code: resultCode,
          };
        }
        return undefined;
      };
    }
  );

const notEmpty: TFieldValidatorSelector =
  (error: TValidationError) => (value) =>
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (isObject(value) && isEmpty(value) && !(value instanceof Model)) ||
    (typeof value === "string" && value.trim() === "")
      ? error
      : undefined;
/**
 * Валидатор, проверяющий значение на "не пустоту" и возвращающий, в случае, если значение
 * не прошло валидацию - код ошибки о пустоте поля
 * @returns код ошибки | undefined
 */
export const notEmptyMemoizeWithoutMessage = notEmpty({
  code: TestIdsUtils.FIELD_EMPTY,
});

/**
 * Валидатор, проверяющий значение на "не пустоту" и возвращающий, в случае, если значение
 * не прошло валидацию - код ошибки о пустоте поля с соответствующим сообщением
 * @param local - локализация
 * @returns error | undefined
 */
export const notEmptyMemoize = createSelector(
  (local: Localization) => local.getLocalized(notEmptyFieldLoc),
  (message: string) =>
    notEmpty({
      message,
      code: TestIdsUtils.FIELD_EMPTY,
    })
);

/**
 * Валидатор, проверяющий значение на "не пустоту" и возвращающий, в случае, если значение
 * не прошло валидацию - код ошибки о пустоте поля с сообщением, переданным в качестве параметра
 * @param local - локализация
 * @param customMessageLoc - текст кастомного сообщения об ошибке
 * @returns error с переданным в качестве параметра сообщением с кодом | undefined
 */
export const notEmptyMemoizeWithCustomMessage = createSelector(
  (local: Localization) => local,
  (local: Localization, customMessageLoc: TLocalizationDescription) =>
    customMessageLoc,
  (local: Localization, customMessageLoc: TLocalizationDescription) =>
    notEmpty({
      message: local.getLocalized(customMessageLoc),
      code: TestIdsUtils.FIELD_EMPTY,
    })
);

const isValidEmail: TFieldValidatorSelector =
  (error: TValidationError) => (value, allValues, meta) => {
    return value && meta && meta.initial !== value && !emailRegexp.test(value)
      ? error
      : undefined;
  };

/**
 * Валидатор, проверяющий значение на соответствие регулярному выражению адреса электронной почты
 * и возвращающий, в случае, если значение не прошло валидацию - соответствующий код ошибки с
 * сообщением о том, что введенное значение не является адресом электронной почты
 * @param local - локализация
 * @returns error | undefined
 */
export const isValidEmailMemoize = createSelector(
  (local: Localization) => local.getLocalized(isValidEmailLoc),
  (message) => {
    return isValidEmail({
      message,
      code: TestIdsUtils.ENTER_CORRECT_EMAIL,
    });
  }
);

/**
 * Валидатор, проверяющий значение на соответствие регулярному выражению адреса электронной почты
 * и "не пустоту", в случае, если значение не прошло валидацию возвращает соответствующий код ошибки с
 * сообщением о том, что введенное значение не является адресом электронной почты или пустое
 * @param local - локализация
 * @returns error | undefined
 */
export const isValidEmailAndNotEmptyMemoize = combineValidators([
  notEmptyMemoize,
  isValidEmailMemoize,
]);

const notEmptyTimepickers: TFieldValidatorSelector =
  (error: TValidationError) => (value) =>
    !value || !value.begin || !value.end ? error : undefined;

const isValidTimepickers: TFieldValidatorSelector =
  (error: TValidationError) => (value) =>
    value.begin.hour * SecondsPerHour +
      value.begin.minute * SecondsPerMinute +
      value.begin.second >
    value.end.hour * SecondsPerHour +
      value.end.minute * SecondsPerMinute +
      value.end.second
      ? error
      : undefined;

/**
 * Валидатор, проверяющий Timepicker на "не пустоту", возвращает только код ошибки
 * @returns код ошибки | undefined
 */
export const notEmptyTimepickersWithoutMessage = notEmptyTimepickers({
  code: TestIdsUtils.FIELD_EMPTY,
});

/**
 * Валидатор, проверяющий Timepicker на его валидность (время начала > времени конца), возвращает только код
 * @returns код ошибки | undefined
 */
export const isValidTimepickersWithoutMessage = isValidTimepickers({
  code: TestIdsUtils.FIELD_EMPTY,
});

const isValidNumber: TFieldValidatorSelector =
  (error: TValidationError) => (value) =>
    isNaN(value) ? error : undefined;

/**
 * Валидатор проверяющий на валидность введенного числа
 */
export const isValidNumberWithoutMessage = isValidNumber({
  code: TestIdsUtils.ENTER_CORRECT_NUMBER,
});
