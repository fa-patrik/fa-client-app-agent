import { sanitizeNumberInputValue } from "./input";

describe("input utility functions", () => {
  describe("sanitizeNumberInputValue function", () => {
    it("should remove non-digit and non-decimal characters", () => {
      expect(sanitizeNumberInputValue("abc12.3xyz", 0, 100, 2)).toBe("12.3");
    });

    it("should remove extra decimal points", () => {
      expect(sanitizeNumberInputValue("12.3.4", 0, 100, 2)).toBe("12.34");
    });

    it("should replace value with max if it exceeds max", () => {
      expect(sanitizeNumberInputValue("105", 0, 100, 2)).toBe("100");
    });

    it("should replace value with min if it is less than min", () => {
      expect(sanitizeNumberInputValue("0", 10, 100, 2)).toBe("10");
    });

    it("should limit decimal places to given number", () => {
      expect(sanitizeNumberInputValue("12.3456", 0, 100, 2)).toBe("12.35");
    });

    it("should handle min and max being undefined", () => {
      expect(sanitizeNumberInputValue("12.3", undefined, undefined, 2)).toBe(
        "12.3"
      );
    });

    it("should handle value being empty string", () => {
      expect(sanitizeNumberInputValue("", 0, 100, 2)).toBe("");
    });
  });
});
