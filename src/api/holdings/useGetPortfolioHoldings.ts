import { gql, useQuery } from "@apollo/client";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { getFetchPolicyOptions } from "../utils";
import { ALLOCATION_BY_SECURITY_TYPE_FIELDS } from "./fragments";
import { PortfolioHoldingsQuery } from "./types";
import { filterZeroPositions } from "./useGetAllPortfoliosHoldings";

const HOLDINGS_QUERY = gql`
  ${ALLOCATION_BY_SECURITY_TYPE_FIELDS}
  query GetPortfolioHoldings($portfolioId: Long, $locale: Locale) {
    portfolio(id: $portfolioId) {
      id
      analytics(
        parameters: {
          paramsSet: {
            key: "holdingsByTypeBySecurity"
            timePeriodCodes: "DAYS-0"
            grouppedByProperties: [TYPE, POSITION]
            includeData: false
            includeChildren: true
            drilldownEnabled: false
            limit: 0
            locale: $locale
          }
          includeDrilldownPositions: false
        }
      ) {
        allocationTopLevel: grouppedAnalytics(key: "holdingsByTypeBySecurity") {
          portfolio {
            id
            currencyCode
          }
          ...AllocationBySecurityTypeFields
        }
      }
    }
  }
`;

export const useGetPortfolioHoldings = (portfolioId: string | undefined) => {
  const { i18n } = useModifiedTranslation();
  const { loading, error, data } = useQuery<PortfolioHoldingsQuery>(
    HOLDINGS_QUERY,
    {
      variables: {
        portfolioId,
        locale: i18n.language,
      },
      ...getFetchPolicyOptions(`useGetPortfolioHoldings.${portfolioId}`),
    }
  );

  return {
    loading,
    error,
    data: data && {
      allocationByType: filterZeroPositions(
        data?.portfolio?.analytics?.allocationTopLevel?.allocationByType
      ),
      currency:
        data?.portfolio?.analytics?.allocationTopLevel?.portfolio?.currencyCode,
    },
  };
};
