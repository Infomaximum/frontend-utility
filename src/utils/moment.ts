import moment from "moment";

/**
 * Обновляет параметры локализации в moment
 * @param locale
 * @param firstDayOfTheWeek
 */
export const momentLocaleUpdate = function (
  locale: string,
  firstDayOfTheWeek: number
) {
  moment.locale(locale);
  moment.updateLocale(locale, {
    week: {
      dow: firstDayOfTheWeek,
    },
  } as moment.LocaleSpecification);
};
