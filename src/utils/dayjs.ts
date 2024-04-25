import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";

dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(duration);

/**
 * Обновляет параметры локализации в moment
 * @param locale
 * @param firstDayOfTheWeek
 */
export const localeUpdate = function (
  locale: string,
  firstDayOfTheWeek: number,
) {
  dayjs.locale(locale);
  dayjs.updateLocale(locale, {
    week: {
      dow: firstDayOfTheWeek,
    },
  });
};
