import { renderHook } from "@testing-library/react-hooks";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { portfolioOptionsMock } from "test/mockData/portfolioOptions";
import { useTradablePortfolioSelect } from "./useTradablePortfolioSelect";

//used by useGetPortfolioOptions
jest.mock("api/initial/useGetContactInfo", () => ({
  useGetContactInfo: jest.fn(() => ({ data: { portfolios: [] } })),
}));
//used by useGetPortfolioOptions
jest.mock("providers/ContractIdProvider", () => ({
  useGetContractIdData: jest.fn(() => ({ selectedContactId: 1 })),
}));
jest.mock("hooks/useGetPortfolioOptions");
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
}));

describe("useTradablePortfolioSelect", () => {
  beforeEach(() => {
    (useGetPortfolioOptions as jest.Mock).mockReturnValue(portfolioOptionsMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should pre-select the parent portfolio chosen in main portfolio selector if it is tradable", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: 1 });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should pre-select the sub portfolio chosen in main portfolio selector if it is tradable", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: 4 });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });

  it("should not pre-select a portfolio if there are multiple tradable portfolios (incl subs) and no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: undefined });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(undefined);
  });

  it("should pre-select the only tradable parent portfolio when no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: undefined });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[0],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should pre-select the only tradable sub portfolio when no tradable portfolio chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: undefined });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[2],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });

  it("should pre-select the only tradable parent portfolio even though another portfolio is chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: 1 });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[1],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(2);
  });

  it("should pre-select the only tradable sub portfolio even though another portfolio is chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: 3 });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[2],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(4);
  });
});
