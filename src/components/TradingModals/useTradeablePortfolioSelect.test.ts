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

  it("should pre-select the portfolio chosen in main portfolio selector if it is tradeable", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: "1" });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should not pre-select a portfolio if there are multiple tradeable portfolios and no tradeable portfolio chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: undefined });
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(undefined);
  });

  it("should pre-select the only tradeable portfolio when no tradeable portfolio chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: undefined });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[0],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(1);
  });

  it("should pre-select the only tradeable portfolio even though another portfolio is chosen in main portfolio selector", () => {
    (useParams as jest.Mock).mockReturnValue({ portfolioId: "1" });
    (useGetPortfolioOptions as jest.Mock).mockReturnValue([
      portfolioOptionsMock[1],
    ]);
    const { result } = renderHook(() => useTradablePortfolioSelect());
    expect(result.current.portfolioId).toBe(2);
  });
});
