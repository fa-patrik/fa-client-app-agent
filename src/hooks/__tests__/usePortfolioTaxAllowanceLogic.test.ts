import { renderHook } from "@testing-library/react";
import type {
  ClientTaxAllowancesResult,
  ClientTaxAllowance,
} from "api/taxes/useGetClientTaxAllowances";
import { usePortfolioTaxAllowanceLogic } from "../usePortfolioTaxAllowanceLogic";

describe("usePortfolioTaxAllowanceLogic", () => {
  const mockIsaAllowance: ClientTaxAllowance = {
    taxWrapperCode: "ISA",
    taxWrapperId: "isa-1",
    taxWrapperName: "Individual Savings Account",
    calcDate: "2024-04-05",
    usedAllowance: 5000,
    remainingAllowance: 15000,
    totalAllowance: 20000,
    utilizationPercentage: 25,
    children: [{ code: "CISA" }, { code: "SSISA" }],
    portfolioTypes: [
      { id: "1", code: "ISA", name: "Individual Savings Account" },
    ],
  };

  const mockChildAllowances: ClientTaxAllowance[] = [
    {
      taxWrapperCode: "CISA",
      taxWrapperId: "cisa-1",
      taxWrapperName: "Cash ISA",
      calcDate: "2024-04-05",
      usedAllowance: 2000,
      remainingAllowance: 8000,
      totalAllowance: 10000,
      utilizationPercentage: 20,
      children: [],
      portfolioTypes: [{ id: "2", code: "CISA", name: "Cash ISA" }],
    },
    {
      taxWrapperCode: "SSISA",
      taxWrapperId: "ssisa-1",
      taxWrapperName: "Stocks & Shares ISA",
      calcDate: "2024-04-05",
      usedAllowance: 3000,
      remainingAllowance: 7000,
      totalAllowance: 10000,
      utilizationPercentage: 30,
      children: [],
      portfolioTypes: [{ id: "3", code: "SSISA", name: "Stocks & Shares ISA" }],
    },
  ];

  const mockTaxAllowanceData: ClientTaxAllowancesResult = {
    contact: { id: "contact-1", name: "Test Contact" },
    isaAllowance: mockIsaAllowance,
    childAllowances: mockChildAllowances,
    summary: {
      totalAllowanceAcrossAllWrappers: 20000,
      totalUsedAcrossAllWrappers: 5000,
      totalRemainingAcrossAllWrappers: 15000,
      currency: "GBP",
      calculationDate: "2024-04-05",
    },
    hasUserTaxConfig: true,
  };

  const mockCisaPortfolio = {
    id: 1,
    typeCode: "CISA",
    name: "Cash ISA Portfolio",
  };

  const mockSsisaPortfolio = {
    id: 2,
    typeCode: "SSISA",
    name: "Stocks & Shares ISA Portfolio",
  };

  const mockNonTaxPortfolio = {
    id: 3,
    typeCode: "GENERAL",
    name: "General Investment Account",
  };

  describe("when portfolio is tax-advantaged (CISA)", () => {
    it("should correctly identify tax-advantaged status", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(true);
      expect(result.current.availableTaxWrapperCodes).toEqual([
        "ISA",
        "CISA",
        "SSISA",
      ]);
    });

    it("should calculate effective allowances as minimum of parent and child", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      // CISA has 8000 remaining, ISA has 15000 remaining -> min is 8000
      expect(result.current.remainingAllowance).toBe(8000);
      // CISA has 10000 total, ISA has 20000 total -> min is 10000
      expect(result.current.totalAllowance).toBe(10000);
    });

    it("should find the correct child allowance", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.childAllowance).toEqual(mockChildAllowances[0]);
      expect(result.current.isaAllowance).toEqual(mockIsaAllowance);
    });

    it("should detect zero allowance correctly", () => {
      const dataWithZeroAllowance = {
        ...mockTaxAllowanceData,
        childAllowances: [
          { ...mockChildAllowances[0], remainingAllowance: 0 },
          mockChildAllowances[1],
        ],
      };

      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: dataWithZeroAllowance,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.hasZeroAllowance).toBe(true);
      expect(result.current.remainingAllowance).toBe(0);
    });

    it("should correctly validate amounts over allowance", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.isAmountOverAllowance(5000)).toBe(false);
      expect(result.current.isAmountOverAllowance(8000)).toBe(false);
      expect(result.current.isAmountOverAllowance(8001)).toBe(true);
      expect(result.current.isAmountOverAllowance(10000)).toBe(true);
    });
  });

  describe("when portfolio is tax-advantaged (SSISA)", () => {
    it("should calculate allowances correctly for different child type", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockSsisaPortfolio,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(true);
      // SSISA has 7000 remaining, ISA has 15000 remaining -> min is 7000
      expect(result.current.remainingAllowance).toBe(7000);
      expect(result.current.childAllowance).toEqual(mockChildAllowances[1]);
    });
  });

  describe("when portfolio is not tax-advantaged", () => {
    it("should return unlimited allowances", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockNonTaxPortfolio,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(false);
      expect(result.current.remainingAllowance).toBe(Infinity);
      expect(result.current.totalAllowance).toBe(0);
      expect(result.current.hasZeroAllowance).toBe(false);
      expect(result.current.childAllowance).toBeUndefined();
    });

    it("should never flag amounts as over allowance", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: mockNonTaxPortfolio,
        })
      );

      expect(result.current.isAmountOverAllowance(1000000)).toBe(false);
    });
  });

  describe("when no portfolio is selected", () => {
    it("should handle undefined portfolio gracefully", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: mockTaxAllowanceData,
          selectedPortfolio: undefined,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(false);
      expect(result.current.remainingAllowance).toBe(Infinity);
      expect(result.current.totalAllowance).toBe(0);
    });
  });

  describe("when tax allowance data is undefined", () => {
    it("should return safe defaults", () => {
      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: undefined,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(false);
      expect(result.current.remainingAllowance).toBe(Infinity);
      expect(result.current.totalAllowance).toBe(0);
      expect(result.current.currency).toBe("GBP");
      expect(result.current.hasZeroAllowance).toBeUndefined();
      expect(result.current.availableTaxWrapperCodes).toEqual([]);
    });
  });

  describe("when ISA allowance is missing but child allowances exist", () => {
    it("should handle missing ISA parent gracefully", () => {
      const dataWithoutIsa = {
        ...mockTaxAllowanceData,
        isaAllowance: null,
      };

      const { result } = renderHook(() =>
        usePortfolioTaxAllowanceLogic({
          taxAllowanceData: dataWithoutIsa,
          selectedPortfolio: mockCisaPortfolio,
        })
      );

      expect(result.current.isPortfolioTaxAdvantaged).toBe(true);
      expect(result.current.availableTaxWrapperCodes).toEqual([
        "CISA",
        "SSISA",
      ]);
      // With no ISA parent, child allowance becomes the effective limit
      expect(result.current.remainingAllowance).toBe(8000);
    });
  });

  describe("memoization", () => {
    it("should memoize results when inputs do not change", () => {
      const { result, rerender } = renderHook(
        ({ taxAllowanceData, selectedPortfolio }) =>
          usePortfolioTaxAllowanceLogic({
            taxAllowanceData,
            selectedPortfolio,
          }),
        {
          initialProps: {
            taxAllowanceData: mockTaxAllowanceData,
            selectedPortfolio: mockCisaPortfolio,
          },
        }
      );

      const firstResult = result.current;

      rerender({
        taxAllowanceData: mockTaxAllowanceData,
        selectedPortfolio: mockCisaPortfolio,
      });

      // Should be the same object reference due to memoization
      expect(result.current).toBe(firstResult);
    });

    it("should recalculate when inputs change", () => {
      const { result, rerender } = renderHook(
        ({ taxAllowanceData, selectedPortfolio }) =>
          usePortfolioTaxAllowanceLogic({
            taxAllowanceData,
            selectedPortfolio,
          }),
        {
          initialProps: {
            taxAllowanceData: mockTaxAllowanceData,
            selectedPortfolio: mockCisaPortfolio,
          },
        }
      );

      const firstResult = result.current;

      rerender({
        taxAllowanceData: mockTaxAllowanceData,
        selectedPortfolio: mockSsisaPortfolio,
      });

      // Should be a different object reference with different values
      expect(result.current).not.toBe(firstResult);
      expect(result.current.remainingAllowance).not.toBe(
        firstResult.remainingAllowance
      );
    });
  });
});
