export const safeParseInt = (str: string): number => {
  try {
    return Number(str);
  } catch (e) {
    return 0;
  }
};

/**
 * @param {int|string} str
 * @param {int} count
 * @param {string} delimiter
 * @returns {string}
 * @static
 */
export const splitWithDelimiters = (
  str: string,
  count: number,
  delimiter: string,
): string => {
  const newStr = str.toString();

  const leftPartCount: number = newStr.length % count;
  const leftPart: string = newStr.slice(0, leftPartCount);
  const rightPart: string = newStr.slice(leftPartCount);

  let counter: number = 0;
  let res: string = "";
  for (let i = 0, l = rightPart.length; i < l; i += 1) {
    counter += 1;
    res += rightPart[i];
    if (counter === count && i !== l - 1) {
      counter = 0;
      res += delimiter;
    }
  }

  if (leftPart !== "") {
    res = leftPart + (res !== "" ? delimiter + res : "");
  }

  return res;
};
