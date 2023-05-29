import { gql, useQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/generic/useGetSubPortfolioIds";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import {
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "./fragments";
import { PortfolioOverviewQuery } from "./types";

const PORTFOLIO_OVERVIEW_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  query GetPortfolioOverview($portfolioIds: [Long], $locale: Locale) {
    analytics(
      parameters: {
        pfIds: $portfolioIds
        paramsSet: {
          key: "portfolioOverview"
          timePeriodCodes: "DAYS-0"
          grouppedByProperties: [TYPE, SECURITY]
          includeData: false
          includeChildren: true
          drilldownEnabled: false
          limit: 0
          locale: $locale
        }
        includeDrilldownPositions: false
      }
    ) {
      grouppedAnalytics(key: "portfolioOverview") {
        portfolio {
          id
        }
        firstAnalysis {
          marketValue
          tradeAmount
        }
        ...SecurityTypeWithSecuritiesData
      }
    }
  }
`;

export const useGetPortfolioOverview = (id: number | undefined) => {
  const { i18n } = useModifiedTranslation();
  const subPortfolioIds = useGetSubPortfolioIds(id);
  const ids = id ? [id, ...subPortfolioIds] : [];
  const { loading, error, data } = useQuery<PortfolioOverviewQuery>(
    PORTFOLIO_OVERVIEW_QUERY,
    {
      variables: {
        portfolioIds: ids,
        locale: i18n.language,
      },
    }
  );
  return { loading, error, data };
};
