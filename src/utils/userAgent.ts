import { EUserAgents } from "../const";

const msie =
  Boolean(window.navigator.userAgent.indexOf("MSIE ") > 0) ||
  /Trident.*rv\:11\./.test(window.navigator.userAgent);

const edge = /Edge\//.test(window.navigator.userAgent);

const webkit = /AppleWeb[kK]it/.test(window.navigator.userAgent);

const safari = /^((?!chrome|android).)*safari/i.test(
  window.navigator.userAgent
);

const userAgent = (): string | undefined => {
  switch (true) {
    case msie:
      return EUserAgents.MSIE;
    case edge:
      return EUserAgents.Edge;
    case safari:
      return EUserAgents.Safari;
    case webkit:
      return EUserAgents.WebKit;
    default:
      break;
  }
};

export default userAgent;
