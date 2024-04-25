import { Localization } from "@infomaximum/localization";
import dayjs from "dayjs";
import {
  getConvertedMsToHours,
  getCollapsedDateRangeLabel,
  formatEnteredTime,
  getLocalizedHours,
  dayjsToServerObject,
  utcTimestampToServerObject,
  getDateServerObject,
  getTimeServerObject,
  getFormattedDate,
  format,
  excelFormat,
  capitalizedShortFormat,
  getFormattedTime,
  getSignFormattedTime,
  getClockTime,
  getDateTimeClockTime,
  getDurationTime,
  getDayTime,
  getFormattedDuration,
  getDurationDescription,
  getDurationInHours,
  getUTCStartOfDay,
  getPadDigits,
  roundToMinutes,
  floorMillisecondsToHour,
  ceilMillisecondsToHour,
  FORMATTED_DURATION_DESCRIPTION_TYPE,
} from "./Date";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import "dayjs/locale/ru";
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(duration);

const TimeFormatConditions = {
  seconds(h: number, m: number, s: number): boolean {
    return s !== 0 && h >= 0 && m !== 0;
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

describe("Тест файла Date", () => {
  it("Тестирование функции getFormattedDuration({localization, value, digits})", () => {
    const firstValue = {
      localization: new Localization({ language: Localization.Language.ru }),
      value: 18900000,
      digits: 1,
    };

    const secondValue = {
      localization: new Localization({ language: Localization.Language.ru }),
      value: 36000000000,
    };

    expect(getFormattedDuration(firstValue)).toBe("5 ч 15 мин");
    expect(getFormattedDuration(secondValue)).toBe("10тыс. ч");
  });

  it("Тестирование функции getFormattedDuration({localization, value, conditions, digits})", () => {
    const firstValue = {
      localization: new Localization({ language: Localization.Language.en }),
      value: 66000,
      digits: 2,
      conditions: TimeFormatConditions,
    };

    const secondValue = {
      localization: new Localization({ language: Localization.Language.ru }),
      value: 36370000,
      conditions: TimeFormatConditions,
      digits: 1,
    };

    expect(getFormattedDuration(firstValue)).toBe("1 m 06 s");
    expect(getFormattedDuration(secondValue)).toBe("10 ч 6 мин 10 сек");
  });

  it("Тестирование функции getFormattedDuration({localization, value, conditions, descriptionType, digits})", () => {
    const value = {
      localization: new Localization({ language: Localization.Language.ru }),
      value: 36365000,
      conditions: TimeFormatConditions,
      descriptionType: FORMATTED_DURATION_DESCRIPTION_TYPE.LONG,
      digits: 1,
    };

    expect(getFormattedDuration(value)).toBe("10 часов 6 минут 5 секунд");
  });

  it("Тестирование функции getFormattedDuration({localization, value})", () => {
    const value = {
      localization: new Localization({ language: Localization.Language.ru }),
      value: 18360000,
    };
    expect(getFormattedDuration(value)).toBe("5 ч 06 мин");
  });

  it("Тестирование функции getDurationDescription", () => {
    const value = 38160000;
    expect(getDurationDescription(value)).toStrictEqual({
      hours: 10,
      minutes: 36,
      seconds: 0,
    });
  });

  it("Тестирование функции getConvertedMsToHours", () => {
    const time = 38160000;
    const precision = 0;
    expect(getConvertedMsToHours(time, precision)).toBe("11");
  });

  test.each`
    dateFrom                    | dateTo                      | dateFormat    | expected
    ${dayjs.utc(1608729945950)} | ${dayjs.utc(1608816345950)} | ${"YY MM DD"} | ${"20 12 23 - 20 12 24"}
    ${dayjs.utc(1608729945950)} | ${dayjs.utc(1608816345950)} | ${undefined}  | ${"23 - 24 December 2020"}
  `(
    "Тестирование функции getCollapsedDateRangeLabel(dateFrom = $dateFrom; dateTo = $dateTo; dateFormat = $dateFormat)",
    ({ dateFrom, dateTo, dateFormat, expected }) => {
      expect(getCollapsedDateRangeLabel(dateFrom, dateTo, dateFormat)).toBe(
        expected
      );
    }
  );

  it("Тестирование функции formatEnteredTime", () => {
    const value = "1237";
    expect(formatEnteredTime(value)).toBe("12:37");
  });

  it("Тестирование функции getLocalizedHours", () => {
    const value = 5400000;
    const localization = new Localization({
      language: Localization.Language.ru,
    });
    expect(getLocalizedHours(value, localization)).toBe("1.5 ч.");
  });

  it("Тестирование функции momentToServerObject", () => {
    const value = dayjs.utc(1608729945950);
    expect(dayjsToServerObject(value)).toStrictEqual({
      time: { hour: 13, minute: 25, second: 45 },
      date: { year: 2020, month: "DECEMBER", day: 23 },
    });
  });

  it("Тестирование функции momentToServerObject c falsy аргументом", () => {
    expect(dayjsToServerObject(undefined)).toBeNull();
  });

  it("Тестирование функции utcTimestampToServerObject", () => {
    const value = 1608824581;
    expect(utcTimestampToServerObject(value)).toStrictEqual({
      time: { hour: 15, minute: 43, second: 1 },
      date: { year: 2020, month: "DECEMBER", day: 24 },
    });
  });

  it("Тестирование функции utcTimestampToServerObject c falsy аргументом", () => {
    expect(utcTimestampToServerObject(null)).toBeNull();
  });

  test.each`
    moment                    | expected
    ${dayjs.unix(1608824581)} | ${{ year: 2020, month: "DECEMBER", day: 24 }}
    ${null}                   | ${undefined}
  `(
    "Тестирование функции getDateServerObject(moment = $moment)",
    ({ moment, expected }) => {
      expect(getDateServerObject(moment)).toStrictEqual(expected);
    }
  );

  test.each`
    moment                    | expected
    ${dayjs.unix(1608824581)} | ${{ hour: dayjs.unix(1608824581).hour(), minute: 43, second: 1 }}
    ${null}                   | ${undefined}
  `(
    "Тестирование функции getTimeServerObject(moment = $moment)",
    ({ moment, expected }) => {
      expect(getTimeServerObject(moment)).toStrictEqual(expected);
    }
  );

  test.each`
    time             | tFormat                   | expected
    ${1608729945950} | ${"DAY_MONTH_YEAR_SHORT"} | ${"23.12.2020"}
    ${1608729945950} | ${"MONTH_MIDDLE"}         | ${"Dec"}
  `(
    "Тестирование функции format(time = $time, format = $tFormat)",
    ({ time, tFormat, expected }) => {
      expect(format(time, tFormat)).toBe(expected);
    }
  );

  it("Тестирование функции getFormattedDate(value: number)", () => {
    const value = 1608729945950;
    const format = "DD MMMM YYYY";
    expect(getFormattedDate(value, format)).toBe("23 december 2020");
  });

  test.each`
    format         | expected
    ${"SHORT"}     | ${"ddd\\,\\ dd"}
    ${"DAY_MONTH"} | ${"D MMMM"}
  `(
    "Тестирование функции excelFormat(format = $format)",
    ({ format, expected }) => {
      expect(excelFormat(format)).toBe(expected);
    }
  );

  it("Тестирование функции capitalizedShortFormat", () => {
    const value = 1608729945950;
    expect(capitalizedShortFormat(value)).toBe("23 We");
  });

  test.each`
    time       | asHours      | seconds      | expected
    ${3960000} | ${undefined} | ${undefined} | ${"01:06"}
    ${3960000} | ${true}      | ${undefined} | ${"01:06"}
    ${3965000} | ${true}      | ${true}      | ${"01:06:05"}
  `(
    "Тестирование функции getFormattedTime(time = $time; asHours = $asHours; seconds = $seconds)",
    ({ time, asHours, seconds, expected }) => {
      expect(getFormattedTime(time, asHours, seconds)).toBe(expected);
    }
  );

  test.each`
    time        | asHours | seconds | expected
    ${3965000}  | ${true} | ${true} | ${"01:06:05"}
    ${-3965000} | ${true} | ${true} | ${"-01:06:05"}
  `(
    "Тестирование функции getSignFormattedTime(time = $time)",
    ({ time, asHours, seconds, expected }) => {
      expect(getSignFormattedTime(time, asHours, seconds)).toBe(expected);
    }
  );

  test.each`
    milliseconds | expected
    ${62000}     | ${"00:01"}
    ${null}      | ${"00:00"}
  `(
    "Тестирование функции getClockTime(milliseconds = $milliseconds)",
    ({ milliseconds, expected }) => {
      expect(getClockTime(milliseconds)).toBe(expected);
    }
  );

  test.each`
    milliseconds  | expected
    ${1608891992} | ${"14:55"}
    ${null}       | ${"00:00"}
  `(
    "Тестирование функции getDateTimeClockTime(milliseconds = $milliseconds)",
    ({ milliseconds, expected }) => {
      expect(getDateTimeClockTime(milliseconds)).toBe(expected);
    }
  );

  test.each`
    time           | Localization                                                | expected
    ${47304000000} | ${new Localization({ language: Localization.Language.ru })} | ${"1 год"}
    ${15768000000} | ${new Localization({ language: Localization.Language.ru })} | ${"6 месяцев"}
    ${345600000}   | ${new Localization({ language: Localization.Language.en })} | ${"4 days"}
    ${36000000}    | ${new Localization({ language: Localization.Language.ru })} | ${"10 часов"}
    ${1800000}     | ${new Localization({ language: Localization.Language.en })} | ${"30 minutes"}
    ${24000}       | ${new Localization({ language: Localization.Language.ru })} | ${"24 секунды"}
  `(
    "Тестирование функции getDurationTime(time = $time)",
    ({ time, Localization, expected }) => {
      expect(getDurationTime(time, Localization)).toBe(expected);
    }
  );

  test.each`
    milliseconds  | expected
    ${1608896950} | ${53696000}
    ${-1}         | ${-1}
  `(
    "Тестирование функции getDayTime(milliseconds = $milliseconds)",
    ({ milliseconds, expected }) => {
      expect(getDayTime(milliseconds)).toBe(expected);
    }
  );

  test.each`
    milliseconds | expected
    ${18000000}  | ${"5"}
    ${null}      | ${"0"}
  `(
    "Тестирование функции getDurationInHours(milliseconds = $milliseconds)",
    ({ milliseconds, expected }) => {
      expect(getDurationInHours(milliseconds)).toBe(expected);
    }
  );

  it("Тестирование функции getUTCStartOfDay", () => {
    const value = dayjs.utc(1608902163515);
    expect(getUTCStartOfDay(value)).toBeInstanceOf(dayjs);
  });

  it("Тестирование функции getPadDigits", () => {
    const digits = 2;
    const innerFunc = getPadDigits(digits);
    expect(getPadDigits(digits)).toBeInstanceOf(Function);
    expect(innerFunc()).toBe(1);
    expect(innerFunc()).toBe(2);
  });

  test.each`
    milliseconds | expected
    ${62000}     | ${60000}
    ${null}      | ${0}
  `(
    "Тестирование функции roundToMinutes(milliseconds = $milliseconds)",
    ({ milliseconds, expected }) => {
      expect(roundToMinutes(milliseconds)).toBe(expected);
    }
  );

  test.each`
    time       | expected
    ${5040000} | ${3600000}
    ${null}    | ${0}
  `(
    "Тестирование функции floorMillisecondsToHour(time = $time)",
    ({ time, expected }) => {
      expect(floorMillisecondsToHour(time)).toBe(expected);
    }
  );

  test.each`
    time       | expected
    ${5040000} | ${7200000}
    ${null}    | ${0}
  `(
    "Тестирование функции ceilMillisecondsToHour(time = $time)",
    ({ time, expected }) => {
      expect(ceilMillisecondsToHour(time)).toBe(expected);
    }
  );
});
