import { gql, useQuery } from "@apollo/client";
import {
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "api/holdings/fragments";
import { getFetchPolicyOptions } from "api/utils";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { PORTFOLIO_DATA_FRAGMENT } from "./fragments";
import { ContactOverviewQuery } from "./types";

/**
 * Fetching yesterday-today will provide us with the latest available snapshot
 * for today (if available), otherwise yersterday (as a fallback).
 */
const PERIOD_IN_DAYS = 1;

const CONTACT_OVERVIEW_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  ${PORTFOLIO_DATA_FRAGMENT}
  query GetContactOverview(
    $contactId: Long
    $locale: Locale
    $startDate: String
    $endDate: String
  ) {
    contact(id: $contactId) {
      id
      analytics(
        parameters: {
          startDate: $startDate
          endDate: $endDate
          paramsSet: {
            key: "contactOverview"
            timePeriodCodes: "GIVEN"
            grouppedByProperties: [PORTFOLIO, TYPE, POSITION]
            includeData: false
            includeChildren: true
            drilldownEnabled: false
            limit: 0
            locale: $locale
          }
          includeDrilldownPositions: false
        }
      ) {
        contact: grouppedAnalytics(key: "contactOverview") {
          firstAnalysis {
            marketValue
            tradeAmount
          }
          ...PortfolioData
        }
      }
    }
  }
`;

export const useGetContactOverview = (cacheOnly = false) => {
  const { selectedContactId } = useGetContractIdData();
  const { i18n } = useModifiedTranslation();
  const defaultPolicies = getFetchPolicyOptions(
    `useGetContactOverview.${selectedContactId}`
  );
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - PERIOD_IN_DAYS);
  const endDate = new Date();
  const { loading, error, data } = useQuery<ContactOverviewQuery>(
    CONTACT_OVERVIEW_QUERY,
    {
      variables: {
        contactId: selectedContactId,
        locale: i18n.language,
        endDate: endDate.toLocaleDateString("sv-SE"),
        startDate: startDate.toLocaleDateString("sv-SE"),
      },
      fetchPolicy: cacheOnly ? "cache-only" : defaultPolicies.fetchPolicy,
      onCompleted: cacheOnly ? undefined : defaultPolicies.onCompleted,
    }
  );
  return { loading, error, data };
};
