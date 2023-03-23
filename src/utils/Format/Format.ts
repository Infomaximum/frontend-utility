import {
  MillisecondsPerSecond,
  MillisecondsPerMinute,
  MillisecondsPerHour,
  SecondsPerMinute,
  MinutesPerHour,
} from "../../const";
import {
  HOURS_SHORT,
  MINUTES_SHORT,
  SECONDS_SHORT,
  THOUSAND_SHORT,
  MILLION_SHORT,
} from "../../const/utilsLoc";
import { assertSimple } from "@infomaximum/assert";
import type { Localization } from "@infomaximum/localization";

/**
 * Возвращает строку, содержащую число в отформатированном виде:
 *  - если абсолютная величина числа меньше 100,
 *    то возвращает число в формате 89.05
 *  - если абсолютная величина числа больше 100, но меньше 10 000,
 *    то возвращает число в формате 890
 *  - если абсолютная величина числа больше 10 000, но меньше 10 000 000,
 *    то возвращает число в формате 890К или 890тыс
 *  - если абсолютная величина числа больше 10 000 000,
 *    то возвращает число в формате 890М или 890млн
 * @param {number} number - число для форматирования
 * @param {Object} localization
 * @returns {string}
 */
export function formatNumber(number: number, localization: Localization) {
  const absNumber = Math.abs(number);
  if (absNumber < 100) {
    // Округление числа до сотых
    return `${Math.round(number * 100) / 100}`;
  }
  if (Math.round(absNumber) < 10000) {
    // Округление числа до целого
    return `${Math.round(number)}`;
  }
  if (Math.round(absNumber / 1000) < 10000) {
    // Округление числа до тысяч
    return `${Math.round(number / 1000)}${localization.getLocalized(
      THOUSAND_SHORT
    )}`;
  }
  // Округление числа до миллионов
  return `${Math.round(number / 1000000)}${localization.getLocalized(
    MILLION_SHORT
  )}`;
}

/**
 * Возвращает строку, содержащую время в отформатированном виде
 * @param {TMilliseconds} milliseconds - время для форматирования
 * @param {Object} localization
 * @returns {string}
 */
export function formatTime(milliseconds: number, localization: Localization) {
  if (
    milliseconds >= 0 &&
    Math.round(milliseconds / MillisecondsPerSecond) < SecondsPerMinute
  ) {
    // если количество миллисекунд меньше 1 минуты, то возвращает время в формате 59сек
    return `${Math.round(
      milliseconds / MillisecondsPerSecond
    )} ${localization.getLocalized(SECONDS_SHORT)}`;
  }
  if (Math.round(milliseconds / MillisecondsPerMinute) < 10) {
    // если количество миллисекунд больше 1 минуты, но меньше 10 минут,
    // то возвращает время в формате 9 мин 59 сек
    const seconds = Math.round(
      (milliseconds % MillisecondsPerMinute) / MillisecondsPerSecond
    );
    const minutes = Math.floor(milliseconds / MillisecondsPerMinute);
    return `${minutes} ${localization.getLocalized(
      MINUTES_SHORT
    )} ${seconds} ${localization.getLocalized(SECONDS_SHORT)}`;
  }
  if (Math.round(milliseconds / MillisecondsPerMinute) < MinutesPerHour) {
    // если количество миллисекунд больше 10 минут, но меньше 1 часа,
    // то возвращает время в формате 59 мин
    return `${Math.round(
      milliseconds / MillisecondsPerMinute
    )} ${localization.getLocalized(MINUTES_SHORT)}`;
  }
  if (Math.round(milliseconds / MillisecondsPerMinute) < 100 * MinutesPerHour) {
    // если количество миллисекунд больше 1 часа, но меньше 100 часов,
    // то возвращает время в формате 89 ч 59 мин
    const minutes = Math.round(
      (milliseconds % MillisecondsPerHour) / MillisecondsPerMinute
    );
    const hours = Math.floor(milliseconds / MillisecondsPerHour);
    if (minutes === MinutesPerHour) {
      return `${hours + 1} ${localization.getLocalized(HOURS_SHORT)}`;
    }
    if (minutes === 0) {
      return `${hours} ${localization.getLocalized(HOURS_SHORT)}`;
    }
    return `${hours} ${localization.getLocalized(
      HOURS_SHORT
    )} ${minutes} ${localization.getLocalized(MINUTES_SHORT)}`;
  }
  if (Math.round(milliseconds / MillisecondsPerHour) >= 100) {
    // если количество миллисекунд больше 100 часов, но меньше 10 000 часов,
    // то возвращает время в формате 890 ч
    // если количество миллисекунд больше 1 000 часов, но меньше 10 000 000 часов,
    // то возвращает время в формате 890тыс ч
    // если количество миллисекунд больше 10 000 000 часов, то возвращает время в формате 890млн ч
    return `${formatNumber(
      Math.floor(milliseconds / MillisecondsPerHour),
      localization
    )} ${localization.getLocalized(HOURS_SHORT)}`;
  }
  assertSimple(false, "Некорректное время!");
  return null;
}
