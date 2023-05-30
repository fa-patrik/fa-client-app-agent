import { useParams } from "react-router-dom";
import { useGetPortfolioOptions } from "./useGetPortfolioOptions";

export const usePortfolioSelect = () => {
  const portfolioOptions = useGetPortfolioOptions(false);
  const params = useParams();
  const selectedPortfolioId = params.portfolioId
    ? parseInt(params.portfolioId, 10)
    : portfolioOptions[0].id;

  const result = {
    selectedPortfolioId,
    portfolioOptions,
  };

  return result;
};
