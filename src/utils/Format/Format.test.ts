import { Localization } from "@infomaximum/localization";
import { formatNumber, formatTime } from "./Format";

const enLocalization = new Localization({ language: Localization.Language.en });
const ruLocalization = new Localization({ language: Localization.Language.ru });

describe("Тест файла Format", () => {
  test.each`
    number      | localization      | expected
    ${80}       | ${enLocalization} | ${"80"}
    ${80.1324}  | ${ruLocalization} | ${"80.13"}
    ${5645}     | ${enLocalization} | ${"5645"}
    ${11560}    | ${ruLocalization} | ${"12тыс"}
    ${2020443}  | ${ruLocalization} | ${"2020тыс"}
    ${20400504} | ${ruLocalization} | ${"20млн"}
  `(
    "Тестирование функции formatNumber(number = $number, localization = $localization)",
    ({ number, localization, expected }) => {
      expect(formatNumber(number, localization)).toBe(expected);
    },
  );

  test.each`
    milliseconds                               | localization      | expected
    ${36000 /* 1 r-n. */}                      | ${enLocalization} | ${"36 s"}
    ${393000 /* 2 r-n */}                      | ${ruLocalization} | ${"6 мин 33 сек"}
    ${3510000 /* 3 r-n */}                     | ${enLocalization} | ${"59 m"}
    ${7188000 /* 4 r-n */}                     | ${ruLocalization} | ${"2 ч"}
    ${10800000 /* 5 r-n */}                    | ${ruLocalization} | ${"3 ч"}
    ${11100000 /* 6 r-n */}                    | ${ruLocalization} | ${"3 ч 5 мин"}
    ${720000000 /* 7 r-n; 200h */}             | ${ruLocalization} | ${"200 ч"}
    ${10800000000 /* 7 r-n; 3 000h */}         | ${ruLocalization} | ${"3000 ч"}
    ${720000000000 /* 7 r-n; 200 000h */}      | ${ruLocalization} | ${"200тыс ч"}
    ${14400000000000 /* 7 r-n; 4 000 000h */}  | ${ruLocalization} | ${"4000тыс ч"}
    ${72000000000000 /* 7 r-n; 20 000 000h */} | ${ruLocalization} | ${"20млн ч"}
    ${null /* last r-n */}                     | ${ruLocalization} | ${"0 сек"}
  `(
    "Тестирование функции formatTime(milliseconds = $milliseconds, localization = $localization)",
    ({ milliseconds, localization, expected }) => {
      expect(formatTime(milliseconds, localization)).toBe(expected);
    },
  );
});
