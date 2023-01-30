import { gql, useLazyQuery, useQuery } from "@apollo/client";
import {
  Portfolio,
  PORTFOLIO_BASIC_FIELDS,
} from "api/initial/useGetContactInfo";

export const PORTFOLIO_QUERY = gql`
  ${PORTFOLIO_BASIC_FIELDS}
  query GetPortfolioById($portfolioId: Long) {
    portfolio(id: $portfolioId) {
      ...PortfolioBasicFields
    }
  }
`;

interface PortfolioQuery {
  portfolio: Portfolio;
}

/**
 * Gets the portfolio basic fields from apollo cache if it exists there
 * Or alternatively requests it from FA on cache miss.
 * @param portfolioId Database id of portfolio to get.
 * @returns The requested portfolio if found in cache or in FA.
 */
export const useGetPortfolioBasicFieldsById = (portfolioId: number) => {
  const { loading, error, data } = useQuery<PortfolioQuery>(PORTFOLIO_QUERY, {
    variables: {
      portfolioId,
    },
    fetchPolicy: "cache-first",
  });

  return { loading, error, data: data?.portfolio };
};

/**
 * Lazy version of useGetPortfolioBasicFieldsById.
 */
export const useGetPortfolioBasicFieldsByIdLazy = () => {
  const [performQuery] = useLazyQuery<PortfolioQuery>(PORTFOLIO_QUERY, {
    fetchPolicy: "cache-first",
  });

  /**
   * Gets the portfolio basic fields from apollo cache if it exists there
   * Or alternatively requests it from FA on cache miss.
   * @param portfolioId Database id of portfolio to get.
   * @returns The requested portfolio if found in cache or in FA.
   */
  const getPortfolioBasicFieldsById = async (portfolioId: number) => {
    const response = await performQuery({
      variables: {
        portfolioId,
      },
    });
    return response.data?.portfolio;
  };

  return { getPortfolioBasicFieldsById };
};
