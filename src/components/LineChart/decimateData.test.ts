import { describe, it, expect } from "vitest";
import { decimateData, DECIMATION_THRESHOLD } from "./decimateData";

describe("decimateData", () => {
  const createDataPoint = (index: number) => {
    const date = new Date("2024-01-01");
    date.setDate(date.getDate() + index);
    return {
      x: date.toISOString().split("T")[0],
      y: index * 10,
    };
  };

  const createDataPoints = (count: number) =>
    Array.from({ length: count }, (_, i) => createDataPoint(i));

  describe("when data is below threshold", () => {
    it("returns the original data unchanged when below target points", () => {
      const data = createDataPoints(100);
      const result = decimateData(data, 500);

      expect(result).toEqual(data);
      expect(result.length).toBe(100);
    });

    it("returns the original data unchanged when equal to target points", () => {
      const data = createDataPoints(500);
      const result = decimateData(data, 500);

      expect(result).toEqual(data);
      expect(result.length).toBe(500);
    });

    it("handles empty array", () => {
      const result = decimateData([], 500);
      expect(result).toEqual([]);
    });

    it("handles single data point", () => {
      const data = [createDataPoint(0)];
      const result = decimateData(data, 500);

      expect(result).toEqual(data);
      expect(result.length).toBe(1);
    });

    it("handles two data points", () => {
      const data = [createDataPoint(0), createDataPoint(1)];
      const result = decimateData(data, 500);

      expect(result).toEqual(data);
      expect(result.length).toBe(2);
    });
  });

  describe("when data exceeds threshold", () => {
    it("reduces data to target number of points", () => {
      const data = createDataPoints(1000);
      const targetPoints = 100;
      const result = decimateData(data, targetPoints);

      expect(result.length).toBe(targetPoints);
    });

    it("always keeps the first data point", () => {
      const data = createDataPoints(1000);
      const result = decimateData(data, 100);

      expect(result[0]).toEqual(data[0]);
    });

    it("always keeps the last data point", () => {
      const data = createDataPoints(1000);
      const result = decimateData(data, 100);

      expect(result[result.length - 1]).toEqual(data[data.length - 1]);
    });

    it("preserves the chronological order of data points", () => {
      const data = createDataPoints(1000);
      const result = decimateData(data, 100);

      // Find original indices of result points
      const resultIndices = result.map((point) =>
        data.findIndex((d) => d.x === point.x && d.y === point.y)
      );

      // Verify indices are strictly increasing (order is preserved)
      for (let i = 1; i < resultIndices.length; i++) {
        expect(resultIndices[i]).toBeGreaterThan(resultIndices[i - 1]);
      }
    });

    it("all returned points exist in the original data", () => {
      const data = createDataPoints(1000);
      const result = decimateData(data, 100);

      result.forEach((point) => {
        expect(data).toContainEqual(point);
      });
    });
  });

  describe("LTTB algorithm behavior", () => {
    it("preserves peaks in the data", () => {
      // Create data with a clear peak in the middle
      const data = Array.from({ length: 1000 }, (_, i) => ({
        x: `2024-01-01T${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
        y: i === 500 ? 1000 : 10, // Peak at index 500
      }));

      const result = decimateData(data, 100);

      // The peak should be preserved because LTTB selects visually significant points
      const maxY = Math.max(...result.map((p) => p.y));
      expect(maxY).toBe(1000);
    });

    it("preserves valleys in the data", () => {
      // Create data with a clear valley in the middle
      const data = Array.from({ length: 1000 }, (_, i) => ({
        x: `2024-01-01T${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
        y: i === 500 ? -1000 : 10, // Valley at index 500
      }));

      const result = decimateData(data, 100);

      // The valley should be preserved
      const minY = Math.min(...result.map((p) => p.y));
      expect(minY).toBe(-1000);
    });

    it("handles flat data (all same y values)", () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        x: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
        y: 100,
      }));

      const result = decimateData(data, 100);

      expect(result.length).toBe(100);
      // All y values should still be 100
      result.forEach((point) => {
        expect(point.y).toBe(100);
      });
    });

    it("handles data with negative values", () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        x: `2024-01-01T${String(Math.floor(i / 60)).padStart(2, "0")}:${String(i % 60).padStart(2, "0")}:00`,
        y: Math.sin(i / 50) * 100, // Sine wave with negative values
      }));

      const result = decimateData(data, 100);

      expect(result.length).toBe(100);
      // Should have both positive and negative values
      const hasPositive = result.some((p) => p.y > 0);
      const hasNegative = result.some((p) => p.y < 0);
      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles target of 3 points (minimum meaningful decimation)", () => {
      const data = createDataPoints(100);
      const result = decimateData(data, 3);

      expect(result.length).toBe(3);
      expect(result[0]).toEqual(data[0]);
      expect(result[result.length - 1]).toEqual(data[data.length - 1]);
    });

    it("handles large dataset efficiently", () => {
      // 10 years of daily data
      const data = Array.from({ length: 3650 }, (_, i) => {
        const date = new Date("2014-01-01");
        date.setDate(date.getDate() + i);
        return {
          x: date.toISOString().split("T")[0],
          y: Math.random() * 100,
        };
      });

      const startTime = performance.now();
      const result = decimateData(data, DECIMATION_THRESHOLD);
      const endTime = performance.now();

      expect(result.length).toBe(DECIMATION_THRESHOLD);
      // Should complete in reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("handles ISO date strings", () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        x: new Date(2024, 0, 1, 0, 0, i).toISOString(),
        y: i,
      }));

      const result = decimateData(data, 100);

      expect(result.length).toBe(100);
      // Verify dates are still valid ISO strings
      result.forEach((point) => {
        expect(() => new Date(point.x)).not.toThrow();
        expect(new Date(point.x).toISOString()).toBe(point.x);
      });
    });

    it("handles YYYY-MM-DD date format", () => {
      const data = Array.from({ length: 1000 }, (_, i) => {
        const date = new Date("2024-01-01");
        date.setDate(date.getDate() + i);
        return {
          x: date.toISOString().split("T")[0],
          y: i,
        };
      });

      const result = decimateData(data, 100);

      expect(result.length).toBe(100);
    });
  });

  describe("DECIMATION_THRESHOLD constant", () => {
    it("is set to 500", () => {
      expect(DECIMATION_THRESHOLD).toBe(500);
    });
  });
});
