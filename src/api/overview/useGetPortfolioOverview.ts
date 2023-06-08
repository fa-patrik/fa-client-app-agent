import { gql, useLazyQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/generic/useGetSubPortfolioIds";
import { getFetchPolicyOptions } from "api/utils";
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

export const useLazyGetPortfolioOverview = (id: number | undefined) => {
  const { i18n } = useModifiedTranslation();
  const ids = useGetSubPortfolioIds(id);
  const [getPortfolioOverview, { loading, error, data }] =
    useLazyQuery<PortfolioOverviewQuery>(PORTFOLIO_OVERVIEW_QUERY, {
      variables: {
        portfolioIds: ids,
        locale: i18n.language,
      },
      ...getFetchPolicyOptions(`useLazyGetPortfolioOverview.${id}`),
    });
  return { getPortfolioOverview, loading, error, data };
};
