import { usePortfolioSelect } from "hooks/usePortfolioSelect";
import { isPortfolioTradable } from "services/permissions/trade";

export const useTradablePortfolioSelect = () => {
  const { portfolioOptions, setPortfolioId, portfolioId } =
    usePortfolioSelect();
  const tradeableOptions = portfolioOptions.filter(
    (option) => option.details && isPortfolioTradable(option.details)
  );

  //it might be that the portfolioId from usePortfolioSelect is not tradeable
  const portfolioIdIsTradeable = tradeableOptions.some(
    (option) => portfolioId === option.id
  );
  //if it happens to be, use it
  const tradeablePortfolioId = portfolioIdIsTradeable ? portfolioId : undefined;

  return {
    setPortfolioId,
    portfolioId: tradeablePortfolioId,
    portfolioOptions: tradeableOptions,
  };
};
