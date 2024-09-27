import { gql, useLazyQuery } from "@apollo/client";
import { useGetSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
import {
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "api/holdings/fragments";
import { getFetchPolicyOptions } from "api/utils";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { PortfolioOverviewQuery } from "./types";

/**
 * Fetching yesterday-today will provide us with the latest available snapshot
 * for today (if available), otherwise yersterday (as a fallback).
 */
const PERIOD_IN_DAYS = 1;

const PORTFOLIO_OVERVIEW_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  query GetPortfolioOverview(
    $portfolioIds: [Long]
    $locale: Locale
    $startDate: String
    $endDate: String
  ) {
    analytics(
      parameters: {
        pfIds: $portfolioIds
        startDate: $startDate
        endDate: $endDate
        paramsSet: {
          key: "portfolioOverview"
          timePeriodCodes: "GIVEN"
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
  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;
  const ids = useGetSubPortfolioIds(id);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - PERIOD_IN_DAYS);
  const endDate = new Date();
  const [getPortfolioOverview, { loading, error, data }] =
    useLazyQuery<PortfolioOverviewQuery>(PORTFOLIO_OVERVIEW_QUERY, {
      variables: {
        portfolioIds: ids,
        locale: locale,
        endDate: endDate.toLocaleDateString("sv-SE"),
        startDate: startDate.toLocaleDateString("sv-SE"),
      },
      ...getFetchPolicyOptions(`useLazyGetPortfolioOverview.${id}`),
    });
  return { getPortfolioOverview, loading, error, data };
};
