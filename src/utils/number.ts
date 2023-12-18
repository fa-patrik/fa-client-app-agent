export const round = (number: number, decimalPlaces: number) =>
  Math.round((number + Number.EPSILON) * Math.pow(10, decimalPlaces)) /
  Math.pow(10, decimalPlaces);

export const roundDown = (number: number, decimalPlaces: number): number =>
  Math.floor(number * Math.pow(10, decimalPlaces)) /
  Math.pow(10, decimalPlaces);
