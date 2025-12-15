import { renderHook } from "@testing-library/react";

import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetTradebleSecurities } from "api/trading/useGetTradebleSecurities";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { vi } from "vitest";
import { useGetPermittedSecurities } from "../trading";
import { useFeature } from "../usePermission";

// Mock all the dependencies before importing anything
vi.mock("api/common/useGetContactInfo");
vi.mock("api/trading/useGetTradebleSecurities");
vi.mock("providers/ContractIdProvider");
vi.mock("providers/KeycloakProvider", () => ({
  useKeycloak: vi.fn(),
}));
vi.mock("../usePermission");
vi.mock("react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useMemo: (fn: () => any) => fn(),
    useState: (initial: any) => [initial, vi.fn()],
  };
});

const mockUseGetContactInfo = useGetContactInfo as ReturnType<typeof vi.fn>;
const mockUseGetTradebleSecurities = useGetTradebleSecurities as ReturnType<
  typeof vi.fn
>;
const mockUseGetContractIdData = useGetContractIdData as ReturnType<
  typeof vi.fn
>;
const mockUseKeycloak = useKeycloak as ReturnType<typeof vi.fn>;
const mockUseFeature = useFeature as ReturnType<typeof vi.fn>;

describe("useGetPermittedSecurities - Security Group Filtering", () => {
  const mockSecurities = [
    {
      id: 1,
      name: "Security 1",
      groups: [{ id: 100, code: "CP_GROUP1", name: "Group 1" }],
      tagsAsSet: ["Tradeable"],
    },
    {
      id: 2,
      name: "Security 2",
      groups: [{ id: 200, code: "CP_GROUP2", name: "Group 2" }],
      tagsAsSet: ["Tradeable"],
    },
    {
      id: 3,
      name: "Security 3",
      groups: [{ id: 300, code: "OTHER_GROUP", name: "Other Group" }],
      tagsAsSet: ["Tradeable"],
    },
  ];

  const mockFilters = {
    country: { id: null, label: "-" },
    type: { id: null, label: "-" },
    name: "",
  };
  const mockFilterOptions = { country: [], type: [] };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockUseGetContractIdData.mockReturnValue({
      selectedContactId: "contact-1",
    });
    mockUseKeycloak.mockReturnValue({ access: { advisor: false } } as any);
    mockUseFeature.mockReturnValue({
      canPf: vi.fn().mockReturnValue(true),
    } as any);

    mockUseGetTradebleSecurities.mockReturnValue({
      filters: mockFilters,
      setFilters: vi.fn(),
      filterOptions: mockFilterOptions,
      data: mockSecurities,
      loading: false,
      error: undefined,
    });
  });

  describe("Case 1: No portfolio data available - client-side filtering", () => {
    it("should pass empty securityGroupIds and apply client-side filtering when no portfolio data", () => {
      mockUseGetContactInfo.mockReturnValue({
        data: undefined, // No contact data
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, undefined)
      );

      // Verify useGetTradebleSecurities was called with empty array
      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        undefined,
        undefined,
        []
      );

      // Should apply client-side filtering since securityGroupIds is empty
      expect(result.current.data).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });

  describe("Case 2: Portfolio has no security groups - client-side filtering", () => {
    it("should pass empty securityGroupIds when selected portfolio has no security groups", () => {
      const portfolioWithoutGroups = {
        id: 1,
        name: "Portfolio 1",
        securityGroups: [], // No security groups
        status: "A",
        shortName: "PF1",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [portfolioWithoutGroups],
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, 1)
      );

      // Verify useGetTradebleSecurities was called with empty array
      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        undefined,
        undefined,
        []
      );

      // Should apply client-side filtering
      expect(result.current.data).toBeDefined();
    });

    it("should pass empty securityGroupIds when some portfolios have no security groups (mixed scenario)", () => {
      const portfolioWithGroups = {
        id: 1,
        name: "Portfolio 1",
        securityGroups: [
          { id: 100, code: "CP_GROUP1", name: "Group 1", securities: [] },
        ],
        status: "A",
        shortName: "PF1",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      const portfolioWithoutGroups = {
        id: 2,
        name: "Portfolio 2",
        securityGroups: [], // No security groups
        status: "A",
        shortName: "PF2",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [portfolioWithGroups, portfolioWithoutGroups], // Mixed portfolios
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      // Test with no specific portfolio (should check all portfolios)
      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, undefined)
      );

      // Should pass empty array because at least one portfolio has no groups
      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        undefined,
        undefined,
        []
      );

      expect(result.current.data).toBeDefined();
    });
  });

  describe("Case 3: All portfolios have security groups - client-side filtering", () => {
    it("should pass security group IDs when selected portfolio has security groups", () => {
      const portfolioWithGroups = {
        id: 1,
        name: "Portfolio 1",
        securityGroups: [
          { id: 100, code: "CP_GROUP1", name: "Group 1", securities: [] },
          { id: 200, code: "CP_GROUP2", name: "Group 2", securities: [] },
        ],
        status: "A",
        shortName: "PF1",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [portfolioWithGroups],
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, 1)
      );

      // Should pass the actual security group IDs
      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        undefined,
        undefined,
        [100, 200]
      );

      // Should apply client-side filtering
      const expectedSecurities = [
        mockSecurities[0], // Security 1, group CP_GROUP1
        mockSecurities[1], // Security 2, group CP_GROUP2
      ];
      expect(result.current.data).toEqual(expectedSecurities);
    });

    it("should pass unique security group IDs when all portfolios have security groups", () => {
      const portfolio1 = {
        id: 1,
        name: "Portfolio 1",
        securityGroups: [
          { id: 100, code: "CP_GROUP1", name: "Group 1", securities: [] },
          { id: 200, code: "CP_GROUP2", name: "Group 2", securities: [] },
        ],
        status: "A",
        shortName: "PF1",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      const portfolio2 = {
        id: 2,
        name: "Portfolio 2",
        securityGroups: [
          { id: 200, code: "CP_GROUP2", name: "Group 2", securities: [] }, // Duplicate
          { id: 300, code: "CP_GROUP3", name: "Group 3", securities: [] },
        ],
        status: "A",
        shortName: "PF2",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [portfolio1, portfolio2], // Both have groups
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      // Test with no specific portfolio (should collect from all portfolios)
      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, undefined)
      );

      // Should pass unique IDs from all portfolios: [100, 200, 300]
      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        undefined,
        undefined,
        [100, 200, 300]
      );

      // Should apply client-side filtering based on all portfolios
      const expectedSecurities = [
        mockSecurities[0], // Security 1, group CP_GROUP1 (in Portfolio 1)
        mockSecurities[1], // Security 2, group CP_GROUP2 (in Portfolio 1 & 2)
      ];
      expect(result.current.data).toEqual(expectedSecurities);
    });
  });

  describe("Integration with existing functionality", () => {
    it("should pass through options correctly", () => {
      const options = { currencyCode: "USD", tags: ["CustomTag"] };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [],
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      renderHook(() => useGetPermittedSecurities(options, undefined));

      expect(mockUseGetTradebleSecurities).toHaveBeenCalledWith(
        "USD",
        ["CustomTag"],
        []
      );
    });

    it("should handle loading states correctly", () => {
      mockUseGetContactInfo.mockReturnValue({
        data: undefined,
        loading: true, // Contact data loading
        error: undefined,
        refetch: vi.fn(),
      });

      mockUseGetTradebleSecurities.mockReturnValue({
        filters: mockFilters,
        setFilters: vi.fn(),
        filterOptions: mockFilterOptions,
        data: undefined,
        loading: true, // Securities loading
        error: undefined,
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, undefined)
      );

      expect(result.current.loading).toBe(true);
    });

    it("should handle errors correctly", () => {
      const contactError = new Error("Contact fetch failed");
      const securitiesError = new Error("Securities fetch failed");

      mockUseGetContactInfo.mockReturnValue({
        data: undefined,
        loading: false,
        error: contactError,
        refetch: vi.fn(),
      });

      mockUseGetTradebleSecurities.mockReturnValue({
        filters: mockFilters,
        setFilters: vi.fn(),
        filterOptions: mockFilterOptions,
        data: undefined,
        loading: false,
        error: securitiesError,
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, undefined)
      );

      // Should return the securities error (first in the return statement)
      expect(result.current.error).toBe(securitiesError);
    });
  });

  describe("Client-side filtering logic", () => {
    it("should apply client-side filtering when securityGroupIds is empty", () => {
      const mockCanPfTrade = vi.fn().mockReturnValue(true);
      mockUseFeature.mockReturnValue({ canPf: mockCanPfTrade } as any);

      const portfolioWithoutGroups = {
        id: 1,
        name: "Portfolio 1",
        securityGroups: [],
        status: "A",
        shortName: "PF1",
        typeCode: "GENERAL",
        parentPortfolios: [],
        portfolios: [],
        currency: { securityCode: "EUR", amountDecimalCount: 2 },
        portfolioGroups: [],
        representativeTags: {
          portfolioAssetManagers: {},
          portfolioContacts: {},
        },
      };

      mockUseGetContactInfo.mockReturnValue({
        data: {
          id: 1,
          contactId: 1,
          _contactId: "contact-1",
          portfolios: [portfolioWithoutGroups],
          locale: "en-US",
          portfoliosCurrency: "EUR",
          representees: [],
          representativeTags: {},
          name: "Test Contact",
        },
        loading: false,
        error: undefined,
        refetch: vi.fn(),
      });

      const { result } = renderHook(() =>
        useGetPermittedSecurities(undefined, 1)
      );

      // Verify that canPfTrade was called (indicating client-side filtering was applied)
      expect(mockCanPfTrade).toHaveBeenCalled();
      expect(result.current.data).toBeDefined();
    });
  });
});
