// Test for the data transformation logic in useGetClientTaxAllowances
import { StandardSolutionTaxWrapper } from "api/enums";
import type { GetClientTaxAllowancesData } from "../useGetClientTaxAllowances";
import { transformClientTaxAllowances } from "../useGetClientTaxAllowances";

describe("Tax Allowances Data Transformation", () => {
  describe("Empty/Invalid Data Handling", () => {
    it("should return empty result for undefined data", () => {
      const result = transformClientTaxAllowances(undefined);

      expect(result).toEqual({
        contact: null,
        isaAllowance: null,
        childAllowances: [],
        summary: null,
        hasUserTaxConfig: false,
      });
    });

    it("should return empty result for empty contactsByParameters", () => {
      const data = {
        contactsByParameters: [],
      };

      const result = transformClientTaxAllowances(data);

      expect(result).toEqual({
        contact: null,
        isaAllowance: null,
        childAllowances: [],
        summary: null,
        hasUserTaxConfig: false,
      });
    });

    it("should return empty result for null contactsByParameters", () => {
      const data = {
        contactsByParameters: null,
      };

      // @ts-expect-error - test case
      const result = transformClientTaxAllowances(data);

      expect(result).toEqual({
        contact: null,
        isaAllowance: null,
        childAllowances: [],
        summary: null,
        hasUserTaxConfig: false,
      });
    });
  });

  describe("Complete ISA Data Transformation", () => {
    it("should transform complete ISA data correctly", () => {
      const mockData = {
        contactsByParameters: [
          {
            id: "contact-123",
            name: "John Doe",
            calculatedTaxWrapperAllowances: [
              {
                taxWrapper: {
                  id: "isa-1",
                  code: StandardSolutionTaxWrapper.IndividualSavingsAccount,
                  name: "Individual Savings Account",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [
                    { id: "cash-type", code: "CASH", name: "Cash" },
                    { id: "stocks-type", code: "STOCKS", name: "Stocks" },
                  ],
                  children: [
                    { code: StandardSolutionTaxWrapper.CashISA },
                    { code: StandardSolutionTaxWrapper.StocksAndSharesISA },
                  ],
                },
                calcDate: "2024-04-05",
                usedAllowance: 8000,
                remainingAllowance: 12000,
              },
              {
                taxWrapper: {
                  id: "cisa-1",
                  code: StandardSolutionTaxWrapper.CashISA,
                  name: "Cash ISA",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [
                    { id: "cash-type", code: "CASH", name: "Cash" },
                  ],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 5000,
                remainingAllowance: 15000,
              },
              {
                taxWrapper: {
                  id: "ssisa-1",
                  code: StandardSolutionTaxWrapper.StocksAndSharesISA,
                  name: "Stocks & Shares ISA",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [
                    { id: "stocks-type", code: "STOCKS", name: "Stocks" },
                  ],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 3000,
                remainingAllowance: 17000,
              },
            ],
          },
        ],
      };

      const result = transformClientTaxAllowances(
        mockData as GetClientTaxAllowancesData
      );

      // Test contact transformation
      expect(result.contact).toEqual({
        id: "contact-123",
        name: "John Doe",
      });

      // Test hasUserTaxConfig
      expect(result.hasUserTaxConfig).toBe(true);

      // Test ISA allowance transformation
      expect(result.isaAllowance).toEqual({
        taxWrapperCode: StandardSolutionTaxWrapper.IndividualSavingsAccount,
        taxWrapperId: "isa-1",
        taxWrapperName: "Individual Savings Account",
        calcDate: "2024-04-05",
        usedAllowance: 8000,
        remainingAllowance: 12000,
        totalAllowance: 20000,
        utilizationPercentage: 40, // 8000 / 20000 * 100
        children: [
          { code: StandardSolutionTaxWrapper.CashISA },
          { code: StandardSolutionTaxWrapper.StocksAndSharesISA },
        ],
        portfolioTypes: [
          { id: "cash-type", code: "CASH", name: "Cash" },
          { id: "stocks-type", code: "STOCKS", name: "Stocks" },
        ],
      });

      // Test child allowances transformation
      expect(result.childAllowances).toHaveLength(2);

      const cisaChild = result.childAllowances.find(
        (child) => child.taxWrapperCode === StandardSolutionTaxWrapper.CashISA
      );
      expect(cisaChild).toEqual({
        taxWrapperCode: StandardSolutionTaxWrapper.CashISA,
        taxWrapperId: "cisa-1",
        taxWrapperName: "Cash ISA",
        calcDate: "2024-04-05",
        usedAllowance: 5000,
        remainingAllowance: 15000,
        totalAllowance: 20000,
        utilizationPercentage: 25, // 5000 / 20000 * 100
        children: [],
        portfolioTypes: [{ id: "cash-type", code: "CASH", name: "Cash" }],
      });

      const ssisaChild = result.childAllowances.find(
        (child) =>
          child.taxWrapperCode === StandardSolutionTaxWrapper.StocksAndSharesISA
      );
      expect(ssisaChild).toEqual({
        taxWrapperCode: StandardSolutionTaxWrapper.StocksAndSharesISA,
        taxWrapperId: "ssisa-1",
        taxWrapperName: "Stocks & Shares ISA",
        calcDate: "2024-04-05",
        usedAllowance: 3000,
        remainingAllowance: 17000,
        totalAllowance: 20000,
        utilizationPercentage: 15, // 3000 / 20000 * 100
        children: [],
        portfolioTypes: [{ id: "stocks-type", code: "STOCKS", name: "Stocks" }],
      });

      // Test summary transformation
      expect(result.summary).toEqual({
        totalAllowanceAcrossAllWrappers: 20000,
        totalUsedAcrossAllWrappers: 8000,
        totalRemainingAcrossAllWrappers: 12000,
        currency: "GBP",
        calculationDate: "2024-04-05",
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero allowances correctly", () => {
      const mockData = {
        contactsByParameters: [
          {
            id: "contact-123",
            name: "John Doe",
            calculatedTaxWrapperAllowances: [
              {
                taxWrapper: {
                  id: "isa-1",
                  code: StandardSolutionTaxWrapper.IndividualSavingsAccount,
                  name: "Individual Savings Account",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 0,
                remainingAllowance: 0,
              },
            ],
          },
        ],
      };

      const result = transformClientTaxAllowances(mockData);

      expect(result.isaAllowance?.totalAllowance).toBe(0);
      expect(result.isaAllowance?.utilizationPercentage).toBe(0);
      expect(result.summary?.totalAllowanceAcrossAllWrappers).toBe(0);
    });

    it("should handle missing tax wrapper name gracefully", () => {
      const mockData = {
        contactsByParameters: [
          {
            id: "contact-123",
            name: "John Doe",
            calculatedTaxWrapperAllowances: [
              {
                taxWrapper: {
                  id: "isa-1",
                  code: StandardSolutionTaxWrapper.IndividualSavingsAccount,
                  name: "Individual Savings Account",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [],
                  children: [{ code: StandardSolutionTaxWrapper.CashISA }],
                },
                calcDate: "2024-04-05",
                usedAllowance: 10000,
                remainingAllowance: 10000,
              },
              {
                taxWrapper: {
                  id: "cisa-1",
                  code: StandardSolutionTaxWrapper.CashISA,
                  name: "", // Empty name
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 5000,
                remainingAllowance: 15000,
              },
            ],
          },
        ],
      };

      const result = transformClientTaxAllowances(mockData);

      const cisaChild = result.childAllowances.find(
        (child) => child.taxWrapperCode === StandardSolutionTaxWrapper.CashISA
      );
      expect(cisaChild!.taxWrapperName).toBe(
        StandardSolutionTaxWrapper.CashISA
      ); // Should fallback to code
    });

    it("should handle missing currency gracefully", () => {
      const mockData = {
        contactsByParameters: [
          {
            id: "contact-123",
            name: "John Doe",
            calculatedTaxWrapperAllowances: [
              {
                taxWrapper: {
                  id: "isa-1",
                  code: StandardSolutionTaxWrapper.IndividualSavingsAccount,
                  name: "Individual Savings Account",
                  currency: undefined, // Missing currency
                  portfolioTypes: [],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 10000,
                remainingAllowance: 10000,
              },
            ],
          },
        ],
      };

      const result = transformClientTaxAllowances(mockData);

      expect(result.summary?.currency).toBe(""); // Should default to empty string, no assumptions on currency
    });

    it("should handle no ISA allowance (only children)", () => {
      const mockData = {
        contactsByParameters: [
          {
            id: "contact-123",
            name: "John Doe",
            calculatedTaxWrapperAllowances: [
              {
                taxWrapper: {
                  id: "cisa-1",
                  code: StandardSolutionTaxWrapper.CashISA,
                  name: "Cash ISA",
                  currency: {
                    id: "gbp-1",
                    securityCode: "GBP",
                    amountDecimalCount: 2,
                  },
                  portfolioTypes: [],
                  children: [],
                },
                calcDate: "2024-04-05",
                usedAllowance: 5000,
                remainingAllowance: 15000,
              },
            ],
          },
        ],
      };

      const result = transformClientTaxAllowances(mockData);

      expect(result.isaAllowance).toBe(null);
      expect(result.childAllowances).toHaveLength(0); // No children without ISA parent
      expect(result.summary).toBe(null);
      expect(result.hasUserTaxConfig).toBe(true); // Still has config
    });
  });

  describe("Utilization Percentage Calculations", () => {
    it("should calculate utilization percentage correctly for various scenarios", () => {
      const testCases = [
        { used: 0, remaining: 20000, expected: 0 },
        { used: 10000, remaining: 10000, expected: 50 },
        { used: 20000, remaining: 0, expected: 100 },
        { used: 5000, remaining: 15000, expected: 25 },
        { used: 0, remaining: 0, expected: 0 },
      ];

      testCases.forEach(({ used, remaining, expected }) => {
        const mockData = {
          contactsByParameters: [
            {
              id: "contact-123",
              name: "John Doe",
              calculatedTaxWrapperAllowances: [
                {
                  taxWrapper: {
                    id: "isa-1",
                    code: StandardSolutionTaxWrapper.IndividualSavingsAccount,
                    name: "Individual Savings Account",
                    currency: {
                      id: "gbp-1",
                      securityCode: "GBP",
                      amountDecimalCount: 2,
                    },
                    portfolioTypes: [],
                    children: [],
                  },
                  calcDate: "2024-04-05",
                  usedAllowance: used,
                  remainingAllowance: remaining,
                },
              ],
            },
          ],
        };

        const result = transformClientTaxAllowances(mockData);
        expect(result.isaAllowance?.utilizationPercentage).toBe(expected);
      });
    });
  });
});
