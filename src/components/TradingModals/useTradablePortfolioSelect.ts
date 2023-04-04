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
  //if it happens to be, use it, otherwise pick the first from tradeable options
  const tradeablePortfolioId = portfolioIdIsTradeable
    ? portfolioId
    : tradeableOptions?.[0]?.id;

  return {
    setPortfolioId,
    portfolioId: tradeablePortfolioId,
    portfolioOptions: tradeableOptions,
  };
};
