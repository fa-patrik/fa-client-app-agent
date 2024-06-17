import { distributeAmount } from "./trading";

describe("distributeAmount function", () => {
  it("should distribute total evenly for whole numbers", () => {
    expect(distributeAmount(100, 4).sort((a, b) => a - b)).toEqual(
      [25, 25, 25, 25].sort((a, b) => a - b)
    );
  });

  it("should distribute total evenly for floating numbers", () => {
    expect(distributeAmount(100.4, 4).sort((a, b) => a - b)).toEqual(
      [25.1, 25.1, 25.1, 25.1].sort((a, b) => a - b)
    );
  });

  it("should distribute total evenly for numbers requiring rounding", () => {
    expect(distributeAmount(100.44, 3).sort((a, b) => a - b)).toEqual(
      [33.48, 33.48, 33.48].sort((a, b) => a - b)
    );
  });

  it("should distribute total with arbitrary decimal precision", () => {
    expect(distributeAmount(100.444, 3, 3).sort((a, b) => a - b)).toEqual(
      [33.481, 33.481, 33.482].sort((a, b) => a - b)
    );
  });

  it("should distribute total evenly when total is negative", () => {
    expect(distributeAmount(-100, 3).sort((a, b) => a - b)).toEqual(
      [-33.33, -33.33, -33.34].sort((a, b) => a - b)
    );
  });

  it("should return empty array when numSecurities is negative", () => {
    expect(distributeAmount(100, -3).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
  });
});
