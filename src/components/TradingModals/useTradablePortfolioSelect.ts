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
  //otherwise check if there is only one option, and use that
  //else, undefined which equals no portfolio selected
  const tradeablePortfolioId = portfolioIdIsTradeable
    ? portfolioId
    : tradeableOptions.length === 1
    ? tradeableOptions[0].id
    : undefined;

  return {
    setPortfolioId,
    portfolioId: tradeablePortfolioId,
    portfolioOptions: tradeableOptions,
  };
};
