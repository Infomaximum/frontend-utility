import moment from "moment";
import round from "lodash/round";
import padStart from "lodash/padStart";
import pad from "lodash/pad";
import isNumber from "lodash/isNumber";
import clamp from "lodash/clamp";
import capitalize from "lodash/capitalize";
import { splitWithDelimiters } from "../String";
import {
  HOURS_SHORT,
  MINUTES_SHORT,
  SECONDS_SHORT,
  HOURS_LONG,
  MINUTES_LONG,
  SECONDS_LONG,
  MONTHS,
  YEARS,
  DAY,
  THOUSAND_HOURS_SHORT,
  HOURS_ABBREVIATION,
} from "../../const/utilsLoc";
import {
  MillisecondsPerMinute,
  MinutesPerHour,
  SecondsPerMinute,
  MillisecondsPerHour,
  EMonths,
} from "../../const";
import type { Localization } from "@infomaximum/localization";
import { enumValue } from "../graphqlQueryBuilder";

/**
 * Количество миллисекунд с 1970
 * @typedef {number|null} TMilliseconds
 */
export type TMilliseconds = number | null;

/**
 * Секунды
 * @typedef {number|null} TSeconds
 */
export type TSeconds = number | null;

/**
 * Длительность в миллисекундах
 * @typedef {int} TDuration
 */
export type TDuration = number;

/**
 * Условия отображения частей времени
 * @typedef TTimeFormatConditions
 */
export type TTimeFormatConditions = {
  hours(hours: number, minutes?: number, seconds?: number): boolean;
  minutes(hours: number, minutes: number, seconds: number): boolean;
  seconds?(hours: number, minutes: number, seconds: number): boolean;
};

/**
 * Формат отображения даты в зависимости от локали
 * @typedef TDateLocaleFormat
 */
export interface IDateLocaleFormat {
  short: string;
  middle: string;
  long: string;
}

/**
 * Месяца и года приводятся к часам
 * @typedef TDurationDescription
 */
export type TDurationDescription = {
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 * @typedef {string} TTimeString
 */
export type TTimeString = string;

export const DateFormats = {
  SHORT: {
    moment: "D dd", // 9 ср
    excel: "ddd\\,\\ dd",
  },
  DOW: {
    moment: "dd", // Ср
  },
  DOW_MIDDLE: {
    moment: "dd, D MMM", // Ср, 9 авг
  },
  DOW_LONG: {
    moment: "dddd", // Среда
  },
  LONG: {
    moment: "D MMMM YYYY", // 9 августа 2016
  },
  DAY: {
    moment: "D", // 9
  },
  DAY_MONTH: {
    moment: "D MMMM", // 9 августа
  },
  MONTH_MIDDLE: {
    func: (time: number) => moment.utc(time).format("MMM").substr(0, 3), // авг
  },
  MONTH_YEAR: {
    moment: "MMMM YYYY", // Август 2016
  },
  MONTH: {
    moment: "MMMM",
  },
  YEAR: {
    moment: "YYYY", // 2016
  },
  HOUR_MINUTES_LONG: {
    moment: "h:mm / D MMMM YYYY",
  },
  FULL_HOUR_MINUTES_LONG: {
    moment: "HH:mm / D MMMM YYYY",
  },
  DAY_MONTH_YEAR_SHORT: {
    moment: "DD.MM.YYYY",
  },
};

// ------------------------------ get -------------------------------------

/**
 * Конвертирует время из мс в часы с определенной точностью после запятой
 * @param {TDuration} time - время в мс
 * @param {number} precision - количество знаков после запятой
 * @returns {string} - количество часов
 */
export const getConvertedMsToHours = (time: number, precision: number) =>
  moment.duration(time, "ms").asHours().toFixed(precision);

/**
 * Возвращает период дат
 * @param {Moment} dateFrom - начальная дата
 * @param {Moment} dateTo - конечная дата
 * @param {?string} dateFormat - конечная дата
 * @example <caption>Пример использования getCollapsedDateRangeLabel</caption>
 * //returns 20 12 23 - 20 12 24
 * getCollapsedDateRangeLabel(moment.utc(1608729945950),moment.utc(1608816345950),"YY MM DD")
 * @returns {string}
 */
export const getCollapsedDateRangeLabel = (
  dateFrom: moment.Moment,
  dateTo: moment.Moment,
  dateFormat: string = "D MMMM YYYY"
) => {
  const dateFromFormattedArray: string[] = dateFrom
    .format(dateFormat)
    .split(" ");
  const dateToFormattedArray: string[] = dateTo.format(dateFormat).split(" ");

  const uniqueDateFromFormattedArray = [...dateFromFormattedArray];

  for (let i = 2; i >= 0; i -= 1) {
    if (dateToFormattedArray[i] === dateFromFormattedArray[i]) {
      uniqueDateFromFormattedArray.splice(i, 1);
    } else {
      break;
    }
  }

  const divider = uniqueDateFromFormattedArray.length === 0 ? "" : " - ";

  return `${uniqueDateFromFormattedArray.join(
    " "
  )}${divider}${dateToFormattedArray.join(" ")}`;
};

/**
 * Функция, упрощающая ввод времени.
 * Н-р, 11 -> 1:1; 111 -> 1:11; 1111 -> 11:11
 * @param {string} value - строка состоящая из чисел
 * @example <caption>Пример использования formatEnteredTime</caption>
 * //returns 12:37
 * formatEnteredTime("1237")
 * @returns {string}
 */
export const formatEnteredTime = (value: string) => {
  const clearedValue = value.replace(/[^0-9]/gim, "");

  const chunkSize = clearedValue.length <= 2 ? 1 : 2;

  const parts: string[] = [];

  for (let end = clearedValue.length; end >= 1; end -= chunkSize) {
    const begin = clamp(end - chunkSize, 0, Infinity);
    parts.unshift(clearedValue.slice(begin, end));
  }

  return parts.join(":");
};

/**
 * Возвращает количество часов(округленное до 2-х знаков после запятой) по миллисекундам
 * в заданной локализации
 * @param {TDuration} ms - миллисекунды
 * @param {Localization} localization - объект локализации
 * @example <caption>Пример использования getLocalizedHours</caption>
 * //returns 1.5 ч.
 * getLocalizedHours(5400000, localization)
 * @returns {string}
 */
export const getLocalizedHours = (ms: number, localization: Localization) => {
  const hours = moment.duration(ms).asHours();

  return `${round(hours, 2)} ${localization.getLocalized(HOURS_ABBREVIATION)}`;
};

/**
 * возвращает объект с данными для сервера
 * @param {Moment | Duration} time
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum, нужно для отправки мутаций через GraphQlQuery
 */
export const momentToServerObject = (
  time: moment.Moment | moment.Duration | undefined,
  isMonthEnum: boolean = false
) => {
  if (time) {
    if (moment.isDuration(time)) {
      return {
        time: {
          hour: time.hours(),
          minute: time.minutes(),
          second: time.seconds(),
        },
      };
    }

    const month = EMonths[time.month()] as string;

    return {
      time: { hour: time.hour(), minute: time.minute(), second: time.second() },
      date: {
        year: time.year(),
        month: isMonthEnum ? (enumValue(month) as unknown as string) : month,
        day: time.date(),
      },
    };
  }

  return null;
};

/**
 * возвращает объект с данными для сервера
 * @param {TMilliseconds} utcTimestamp - миллисекунды по стандарту utc
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum
 * @returns {object | null}
 */
export const utcTimestampToServerObject = (
  utcTimestamp: number | null,
  isMonthEnum: boolean = false
) =>
  isNumber(utcTimestamp)
    ? momentToServerObject(moment.unix(utcTimestamp).utc(), isMonthEnum)
    : null;

/**
 * возвращает объект с данными(дату) для сервера
 * @param {Moment} date
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum
 * @returns {object | undefined}
 */
export const getDateServerObject = (
  date: moment.Moment,
  isMonthEnum: boolean = false
) => momentToServerObject(date, isMonthEnum)?.date;

/**
 * возвращает объект с данными(время) для сервера
 * @param {Moment} date
 * @returns {object | undefined}
 */
export const getTimeServerObject = (date: moment.Moment | moment.Duration) =>
  momentToServerObject(date)?.time;

/**
 * возвращает объект с данными(дату и смещение часового пояса) для сервера
 * @param {Moment} date
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum
 * @returns {object}
 */
export const getLocalDateServerObject = (
  date: moment.Moment,
  isMonthEnum: boolean = false
) => ({
  local_date: momentToServerObject(date, isMonthEnum)?.date,
  offset: getUtcOffset(),
});

/**
 * возвращает объект с данными(время и смещение часового пояса) для сервера
 * @param {Moment} date
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum
 * @returns {object}
 */
export const getLocalTimeServerObject = (
  date: moment.Moment | moment.Duration
) => ({
  local_time: momentToServerObject(date)?.time,
  offset: getUtcOffset(),
});

/**
 * возвращает объект с данными(дату, время и смещение часового пояса) для сервера
 * @param {Moment} date
 * @param {Boolean} isMonthEnum - преобразовывать значение месяца в Enum
 * @returns {object}
 */
export const getLocalDateTimeServerObject = (
  date: moment.Moment,
  isMonthEnum: boolean = false
) => ({
  ...getLocalDateServerObject(date, isMonthEnum),
  ...getLocalTimeServerObject(date),
});

/**
 * возвращает смещение часового пояса в миллисекундах
 * @returns {number}
 */
export const getUtcOffset = () => moment().utcOffset() * 60000;

/**
 *	Форматирует дату
 * @param {number} time - миллисекунды
 * @param {string} format - формат даты
 * @returns {string}
 */
export const getFormattedDate = (time: number, format: string | undefined) =>
  capitalize(moment.utc(time).format(format));

/**
 * возвращает дату в заданном формате
 * @param {TDuration} time - миллисекунды
 * @param {TDateFormatsKeys} format - строка формата
 * @returns {string}
 */
export const format = (time: number, format: keyof typeof DateFormats) => {
  const dateFormat = DateFormats[format];

  if (
    dateFormat &&
    "func" in dateFormat &&
    typeof dateFormat.func === "function"
  ) {
    return dateFormat.func(time);
  }

  if (dateFormat && "moment" in dateFormat) {
    return getFormattedDate(time, dateFormat.moment);
  }

  return getFormattedDate(time, undefined);
};

/**
 * возвращает excel формат если такой имеется для входящего формата
 * @param {DateFormats} format - строка формата
 * @returns {string}
 */
export const excelFormat = (format: keyof typeof DateFormats) => {
  const dateFormat = DateFormats[format];

  if (dateFormat && "excel" in dateFormat) {
    return dateFormat.excel;
  }

  if (dateFormat && "moment" in dateFormat) {
    return dateFormat.moment;
  }

  return undefined;
};

/**
 *	дублирование формата DateFormats.SHORT, чтобы капитализовать день недели
 * @param {TDuration} time - миллисекунды
 * @returns {string}
 */
export const capitalizedShortFormat = function (time: number) {
  return `${getFormattedDate(time, "D")} ${getFormattedDate(time, "dd")}`;
};

/**
 * Возвращает отображение даты, где максимально возможная компонента - час
 * @param {TDuration} time - миллисекунды
 * @param {?boolean} asHours
 * @param {?boolean} seconds - показывать ли секунды
 * @returns {string}
 * @static
 */
export const getFormattedTime = function (
  time: number,
  asHours?: boolean,
  seconds?: boolean
): string {
  const date = moment.duration(time);

  return `${padStart(
    String(Math.floor(asHours ? date.asHours() : date.hours())),
    2,
    "0"
  )}:${padStart(String(date.minutes()), 2, "0")}${
    seconds ? `:${padStart(String(date.seconds()), 2, "0")}` : ""
  }`;
};

/**
 * Отображает дату с учетом знака и по часам максимум
 * @param {TDuration} time - миллисекунды
 * @param {boolean} asHours
 * @param {boolean} seconds
 * @returns {string}
 * @static
 */
export const getSignFormattedTime = function (
  time: number,
  asHours: boolean,
  seconds: boolean
) {
  let sign = "";
  let _time = time;

  if (time < 0) {
    sign = "-";
    _time = Math.abs(_time);
  }

  return sign + getFormattedTime(_time, asHours, seconds);
};

/**
 * Возвращает отображение времени в сутках
 * @param {TMilliseconds} milliseconds - миллисекунды
 * @returns {string}
 * @static
 */
export const getClockTime = function (milliseconds: number): string {
  return getFormattedTime(roundToMinutes(milliseconds), true, undefined);
};

/**
 * Возвращает отображение времени без даты
 * @param {TMilliseconds} time - миллисекунды
 * @returns {string}
 * @static
 */
export const getDateTimeClockTime = function (time: number): string {
  return getFormattedTime(roundToMinutes(time), false, undefined);
};

/**
 * Возвращает отображение самой большой не нулевой компоненты даты
 * @param {TMilliseconds} time - миллисекунды
 * @param {Localization} localization
 * @returns {string}
 * @static
 */
export const getDurationTime = function (
  time: number,
  localization: Localization
) {
  const leftTime = moment.duration(time);
  const yearsCount = leftTime.years();

  if (yearsCount > 0) {
    return `${yearsCount} ${localization.getLocalized(YEARS, {
      count: yearsCount,
    })}`;
  }

  const monthsCount = leftTime.months();
  if (monthsCount > 0) {
    return `${monthsCount} ${localization.getLocalized(MONTHS, {
      count: monthsCount,
    })}`;
  }

  const daysCount = leftTime.days();
  if (daysCount > 0) {
    return `${daysCount} ${localization.getLocalized(DAY, {
      count: daysCount,
    })}`;
  }

  const hoursCount = leftTime.hours();
  if (hoursCount > 0) {
    return `${hoursCount} ${localization.getLocalized(HOURS_LONG, {
      count: hoursCount,
    })}`;
  }

  const minutesCount = leftTime.minutes();
  if (minutesCount > 0) {
    return `${minutesCount} ${localization.getLocalized(MINUTES_LONG, {
      count: minutesCount,
    })}`;
  }

  const secondsCount = leftTime.seconds();
  if (secondsCount > 0) {
    return `${secondsCount} ${localization.getLocalized(SECONDS_LONG, {
      count: secondsCount,
    })}`;
  }

  return null;
};

/**
 * Возвращает количество миллисекунд с начала суток
 * @param {TDuration} milliseconds - миллисекунды
 * @returns {TMilliseconds}
 * @static
 */
export const getDayTime = function (milliseconds: number): number {
  if (milliseconds === -1) {
    return -1;
  }

  const timeMoment = moment.utc(milliseconds);

  const duration = moment
    .duration({
      hours: timeMoment.hours(),
      minutes: timeMoment.minutes(),
      seconds: timeMoment.seconds(),
    })
    .valueOf() as number;

  return duration;
};

export enum FORMATTED_DURATION_DESCRIPTION_TYPE {
  SHORT = 1,
  LONG = 2,
  H_LONG_M_SHORT_S_SHORT = 3,
}

const descriptionLocalizations = {
  [FORMATTED_DURATION_DESCRIPTION_TYPE.SHORT]: {
    hours: HOURS_SHORT,
    minutes: MINUTES_SHORT,
    seconds: SECONDS_SHORT,
  },
  [FORMATTED_DURATION_DESCRIPTION_TYPE.LONG]: {
    hours: HOURS_LONG,
    minutes: MINUTES_LONG,
    seconds: SECONDS_LONG,
  },
  [FORMATTED_DURATION_DESCRIPTION_TYPE.H_LONG_M_SHORT_S_SHORT]: {
    hours: HOURS_LONG,
    minutes: MINUTES_SHORT,
    seconds: SECONDS_SHORT,
  },
};

/**
 * @param {Object} param
 * @param {TMilliseconds} param.value
 * @param {Localization} param.localization
 * @param {int} [param.digits=2] - количество знаков в каждой компоненте времени
 * @param {TTimeFormatConditions} [param.conditions=TimeFormatConditions]
 * @param {int} param.descriptionType
 * @returns {string}
 */
export const getFormattedDuration = function ({
  value,
  localization,
  digits = 2,
  conditions = TimeFormatConditions,
  descriptionType = FORMATTED_DURATION_DESCRIPTION_TYPE.SHORT,
}: {
  value: number;
  localization: Localization;
  digits?: number;
  conditions?: TTimeFormatConditions;
  descriptionType?: (typeof FORMATTED_DURATION_DESCRIPTION_TYPE)[keyof typeof FORMATTED_DURATION_DESCRIPTION_TYPE];
}) {
  let string: string;
  const { seconds } = getDurationDescription(value);
  let { hours, minutes } = getDurationDescription(value);
  const padDigits = getPadDigits(digits);

  const minutesPlusSeconds = Math.round(minutes + seconds / SecondsPerMinute);
  if (minutesPlusSeconds === MinutesPerHour) {
    hours += 1;
    minutes = 0;
  }

  const writeHours = conditions.hours
    ? conditions.hours(hours)
    : hours || digits === 2;
  const writeMinutes = conditions.minutes
    ? conditions.minutes(hours, minutes, seconds)
    : (minutes || digits === 2) && hours < 1000;
  const writeSeconds = conditions.seconds
    ? conditions.seconds(hours, minutes, seconds)
    : !hours && !minutes && seconds;

  if (
    writeHours &&
    hours >= 10000 &&
    !writeMinutes &&
    !writeSeconds &&
    descriptionType === FORMATTED_DURATION_DESCRIPTION_TYPE.SHORT
  ) {
    string =
      splitWithDelimiters(
        pad(String(Math.round(hours / 1000)), padDigits(), "0"),
        3,
        " "
      ) + localization.getLocalized(THOUSAND_HOURS_SHORT);
  } else {
    string =
      (writeHours
        ? `${splitWithDelimiters(
            pad(String(hours), padDigits(), "0"),
            3,
            " "
          )} ${localization.getLocalized(
            descriptionLocalizations[descriptionType].hours,
            {
              count: hours,
            }
          )}`
        : "") +
      (writeMinutes
        ? ` ${padStart(
            String(minutes),
            padDigits(),
            "0"
          )} ${localization.getLocalized(
            descriptionLocalizations[descriptionType].minutes,
            {
              count: minutes,
            }
          )}`
        : "") +
      (writeSeconds
        ? ` ${padStart(
            String(seconds),
            padDigits(),
            "0"
          )} ${localization.getLocalized(
            descriptionLocalizations[descriptionType].seconds,
            {
              count: seconds,
            }
          )}`
        : "");
  }

  return string.trim();
};

/**
 *
 * @type {TTimeFormatConditions}
 * @const
 */
export const TimeFormatConditions = {
  seconds(h: number, m: number, s: number): boolean {
    return s !== 0 && h === 0 && m === 0;
  },
  minutes(h: number, m: number, s: number): boolean {
    return !!(
      (h > 0 && h < 100 && m) ||
      (h === 0 && m) ||
      (h === 0 && m === 0 && s === 0)
    );
  },
  hours(h: number): boolean {
    return h !== 0;
  },
};

/**
 * @type {TTimeFormatConditions}
 * @const
 */
export const CompactFormatConditions = {
  seconds(h: number, m: number, s: number) {
    return s !== 0 && h === 0 && m === 0;
  },
  minutes(h: number, m: number, s: number) {
    return m !== 0 || (h === 0 && m === 0 && s === 0);
  },
  hours(h: number) {
    return h !== 0;
  },
};

/**
 * @type {TTimeFormatConditions}
 * @const
 */
export const FullFormatConditions = {
  seconds(h: number, m: number, s: number) {
    return s !== 0;
  },
  minutes(h: number, m: number, s: number) {
    return m !== 0 || (h === 0 && m === 0 && s === 0);
  },
  hours(h: number) {
    return h !== 0;
  },
};

/**
 * @type {TTimeFormatConditions}
 * @const
 */
export const ShortFormatConditions = {
  minutes(h: number, m: number) {
    return m !== 0 || (h === 0 && m === 0);
  },
  hours(h: number) {
    return h !== 0;
  },
};

/**
 * Возвращает структуру даты по часам, минутам, секундам
 * @param {TMilliseconds} milliseconds
 * @returns {TDurationDescription}
 * @static
 */

export const getDurationDescription = function (milliseconds: number) {
  const duration = moment.duration(milliseconds, "milliseconds");

  return {
    hours: Math.floor(duration.asHours()),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };
};

/**
 * Возвращает количество миллисекунд кратное нацело минутам
 * @param {TMilliseconds} milliseconds
 * @returns {string}
 * @static
 */
export const getDurationInHours = function (milliseconds: number): string {
  const interval = getDurationDescription(roundToMinutes(milliseconds));

  const result = interval.hours + interval.minutes / MinutesPerHour;

  return result.toString();
};

/**
 *	Возвращает объект moment с началом дня
 * @param {moment} momentDate
 * @returns {moment}
 * @static
 */
export const getUTCStartOfDay = function (momentDate: moment.Moment) {
  return moment.utc([momentDate.year(), momentDate.month(), momentDate.date()]);
};

// ----------------------------------- utilities -----------------------------

/**
 *	Возвращает функцию которая при вызове вернет количество символов для описания
 *  времени, но первый раз возвращаемая функция всегда вернет 1
 * @param {int} digits
 * @returns {Function}
 * @static
 */
export const getPadDigits = function (digits: number): () => number {
  let first = true;

  return function () {
    if (first) {
      first = false;
      return 1;
    }
    return digits;
  };
};

/**
 * возвращает количество миллисекунд кратное нацело минутам
 * @param {TMilliseconds} milliseconds
 * @returns {number}
 */
export const roundToMinutes = function (milliseconds: number): number {
  return (
    Math.round(milliseconds / MillisecondsPerMinute) * MillisecondsPerMinute
  );
};

/**
 *
 * @returns {number}
 * @static
 */
export const getTimeZone = function () {
  return -moment().zone() * SecondsPerMinute;
};

/**
 *	возвращает округленное в меньшую сторону количество миллисекунд кратное нацело часам
 * @param {TMilliseconds} time
 * @returns {TMilliseconds}
 * @static
 */
export const floorMillisecondsToHour = function (time: number): number {
  return Math.floor(time / MillisecondsPerHour) * MillisecondsPerHour;
};

/**
 * возвращает округленное в большую сторону количество миллисекунд кратное нацело часам
 * @param {TMilliseconds} time
 * @returns {TMilliseconds}
 * @static
 */
export const ceilMillisecondsToHour = function (time: number): number {
  return Math.ceil(time / MillisecondsPerHour) * MillisecondsPerHour;
};
