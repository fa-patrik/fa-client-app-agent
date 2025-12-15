import { renderHook } from "@testing-library/react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useParams } from "react-router-dom";
import { portfolioOptionsMock } from "test/mockData/portfolioOptions";
import { vi } from "vitest";
import { useTradablePortfolioSelect } from "./useTradablePortfolioSelect";

vi.mock("providers/KeycloakProvider", () => ({
  useKeycloak: vi.fn(),
}));

vi.mock("api/common/useGetContactInfo", () => ({
  useGetContactInfo: vi.fn(),
  PortfolioGroups: {
    CANCEL_ORDER: "CP_CANCEL",
    DEPOSIT: "CP_DEPOSIT",
    WITHDRAW: "CP_WITHDRAWAL",
    TRADE: "CP_TRADING",
    HIDE: "CP_HIDE_PF",
    MONTHLY_INVESTMENTS: "CP_MONTHLYINVESTMENTS",
    MONTHLY_SAVE: "CP_MONTHLYSAVINGS",
  },
  RepresentativeTag: {
    CANCEL_ORDER: "Client portal: Cancel order",
    DEPOSIT: "Client portal: Deposit",
    WITHDRAW: "Client portal: Withdraw",
    TRADE: "Client portal: Trade",
    HIDE: "Client portal: Hide portfolio",
    MONTHLY_INVESTMENTS: "Client portal: Monthly investments",
    MONTHLY_SAVE: "Client portal: Monthly savings",
  },
}));

vi.mock("providers/ContractIdProvider", () => ({
  useGetContractIdData: vi.fn(),
}));

vi.mock("hooks/useGetPortfolioOptions");
vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
}));

describe("useTradablePortfolioSelect", () => {
  beforeEach(() => {
    (useGetPortfolioOptions as ReturnType<typeof vi.fn>).mockReturnValue(portfolioOptionsMock);
    (useKeycloak as ReturnType<typeof vi.fn>).mockReturnValue({ access: { advisor: false } });
    (useGetContractIdData as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedContactId: 1,
    });
    (useGetContactInfo as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { portfolios: [] },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should pre-select the parent portfolio chosen in main portfolio selector if it is tradable", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: 1 });

    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should pre-select the sub portfolio chosen in main portfolio selector if it is tradable", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: 4 });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });

  it("should not pre-select a portfolio if there are multiple tradable portfolios (incl subs) and no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: undefined });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(undefined);
  });

  it("should pre-select the only tradable parent portfolio when no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: undefined });
    (useGetPortfolioOptions as ReturnType<typeof vi.fn>).mockReturnValue([
      portfolioOptionsMock[0],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should pre-select the only tradable sub portfolio when no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: undefined });
    (useGetPortfolioOptions as ReturnType<typeof vi.fn>).mockReturnValue([
      portfolioOptionsMock[2],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });

  it("should pre-select the only tradable parent portfolio even though another portfolio is chosen in main portfolio selector", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: 1 });
    (useGetPortfolioOptions as ReturnType<typeof vi.fn>).mockReturnValue([
      portfolioOptionsMock[1],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(2);
  });

  it("should pre-select the only tradable sub portfolio even though another portfolio is chosen in main portfolio selector", () => {
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ portfolioId: 3 });
    (useGetPortfolioOptions as ReturnType<typeof vi.fn>).mockReturnValue([
      portfolioOptionsMock[2],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });
});
