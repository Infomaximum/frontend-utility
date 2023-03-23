export const round = function (num: number, decimalPlaces: number): number {
  return +`${Math.round(+`${num}e+${decimalPlaces}`)}e-${decimalPlaces}`;
};

export const floor = function (num: number, decimalPlaces: number): number {
  return +`${Math.floor(+`${num}e+${decimalPlaces}`)}e-${decimalPlaces}`;
};
