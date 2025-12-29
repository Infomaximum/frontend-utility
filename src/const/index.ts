import isNil from "lodash/isNil";

export const TestIdAttr = "test-id";
export const InvalidIndex = -1;
export const ScrollContainerClassName = "block-scrollcontainer-container";

export const CancelRequest = "cancel_request";
export const ResendDelays = [0, 1000, 2000, 5000, 12000, 29000];
export const NetworkFailResendAttemptsCount = ResendDelays.length;
export const FormCancelSymbol = Symbol("form_cancel");

export const XTraceIdHeaderKey = "X-Trace-Id";
export const XRequestIdHeaderKey = "X-Request-Id";

export enum EHttpCodes {
  ERROR = 0,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CLIENT_CLOSED_REQUEST = 499,
  BAD_GATEWAY = 502,
  GATEWAY_TIMEOUT = 504,
}

export enum EUserAgents {
  MSIE = "MSIE",
  WebKit = "WebKit",
  Edge = "Edge",
  Safari = "Safari",
}

export const MonthsPerYear = 12;
export const WeekDays = 7;
export const HoursPerDay = 24;
export const MinutesPerHour = 60;
export const SecondsPerMinute = 60;
export const MinutesPerDay = 1440;
export const SecondsPerDay = 86400; // 60 * 60 * 24
export const SecondsPerHour = MinutesPerHour * SecondsPerMinute;
export const SecondsPerWeek = WeekDays * SecondsPerDay;
export const MillisecondsPerSecond = 1000;
export const MillisecondsPerMinute = SecondsPerMinute * MillisecondsPerSecond;
export const MillisecondsPerHour = MinutesPerHour * MillisecondsPerMinute;
export const MillisecondsPerDay = SecondsPerDay * MillisecondsPerSecond;
export const MillisecondsPerWeek = SecondsPerWeek * MillisecondsPerSecond;

export enum EDays {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum EMonths {
  JANUARY = 0,
  FEBRUARY = 1,
  MARCH = 2,
  APRIL = 3,
  MAY = 4,
  JUNE = 5,
  JULY = 6,
  AUGUST = 7,
  SEPTEMBER = 8,
  OCTOBER = 9,
  NOVEMBER = 10,
  DECEMBER = 11,
}

export const Key = {
  DELETE: 46,
  ENTER: 13,
  ESCAPE: 27,
  TAB: 9,
  CTRL: 17,
  F5: 116,
  UP: 38,
  DOWN: 40,
  RIGHT: 39,
  LEFT: 37,
  END: 35,
  HOME: 36,
  BACKSPACE: 8,
  POINT: 46,
  COLON: 59,
  SPACE: 32,
  PLUS: 187,
  MINUS: 189,
  SEMICOLON: 186,

  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,

  A: 65,
  C: 67,
  V: 86,
  X: 88,
  Z: 90,

  NUM_PAD: {
    ZERO: 96,
    NINE: 105,
    PLUS: 107,
    MINUS: 109,
  },
  FIREFOX: {
    PLUS: 61,
    MINUS: 173,
  },
};

/**
 * Ключи клавиш клавиатуры (event.key)
 */
export enum EKeyNames {
  DELETE = "Delete",
  ENTER = "Enter",
  // Для IE
  DEL = "Del",
}

/**
 * Данная константа заменяет null на $null_replaced_value$
 */
export const nullReplacedValue = "$null_replaced_value$";

export const getNullifyValue = (value: any) => {
  if (value === nullReplacedValue) {
    return null;
  }

  return value;
};

export const getNullReplacedValue = (value: any) => {
  if (isNil(value)) {
    return nullReplacedValue;
  }

  return value;
};
