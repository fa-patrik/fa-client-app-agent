import { distributeTradeAmount } from "./trading";

describe("distributeTradeAmount function", () => {
  it("should distribute total evenly for whole numbers", () => {
    expect(distributeTradeAmount(100, 4).sort((a, b) => a - b)).toEqual(
      [25, 25, 25, 25].sort((a, b) => a - b)
    );
  });

  it("should distribute total evenly for floating numbers", () => {
    expect(distributeTradeAmount(100.4, 4).sort((a, b) => a - b)).toEqual(
      [25.1, 25.1, 25.1, 25.1].sort((a, b) => a - b)
    );
  });

  it("should distribute total evenly for numbers requiring rounding", () => {
    expect(distributeTradeAmount(100.44, 3).sort((a, b) => a - b)).toEqual(
      [33.48, 33.48, 33.48].sort((a, b) => a - b)
    );
  });

  it("should distribute total with arbitrary decimal precision", () => {
    expect(distributeTradeAmount(100.444, 3, 3).sort((a, b) => a - b)).toEqual(
      [33.481, 33.481, 33.482].sort((a, b) => a - b)
    );
  });

  it("should return empty array when total is zero", () => {
    expect(distributeTradeAmount(0, 3).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
  });

  it("should return empty array when numSecurities is zero", () => {
    expect(distributeTradeAmount(100, 0).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
  });

  it("should return empty array when total and numSecurities are negative", () => {
    expect(distributeTradeAmount(-100, -3).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
  });

  it("should return empty array when either total or numSecurities are negative", () => {
    expect(distributeTradeAmount(-100, 3).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
    expect(distributeTradeAmount(100, -3).sort((a, b) => a - b)).toEqual(
      [].sort((a, b) => a - b)
    );
  });
});
