import { useState } from "react";
import { useGetPortfolioOptions } from "hooks/useGetPortfolioOptions";
import { useParams } from "react-router-dom";
import { isPortfolioTradable } from "services/permissions/trade";

export const useTradablePortfolioSelect = () => {
  const { portfolioId: urlPortfolioId } = useParams();
  const portfolioOptions = useGetPortfolioOptions(false);
  const tradeableOptions = portfolioOptions.filter(
    (option) => option.details && isPortfolioTradable(option.details)
  );

  // Check if the portfolioId from useParams is tradeable
  const portfolioIdIsTradeable = tradeableOptions.some(
    (option) => urlPortfolioId === option.id.toString()
  );

  const [tradeablePortfolioId, setTradeablePortfolioId] = useState(() => {
    if (urlPortfolioId && portfolioIdIsTradeable) {
      // If the main portfolio selector has chosen a tradeable portfolio
      return parseInt(urlPortfolioId, 10);
    } else if (tradeableOptions.length === 1) {
      // If there is only one tradeable portfolio
      return tradeableOptions[0].id;
    } else {
      // If there are multiple tradeable portfolios, let the user select a portfolio
      return undefined;
    }
  });

  const handleSetPortfolioId = (id: number) => {
    setTradeablePortfolioId(id);
  };

  return {
    setPortfolioId: handleSetPortfolioId,
    portfolioId: tradeablePortfolioId,
    portfolioOptions: tradeableOptions,
  };
};
