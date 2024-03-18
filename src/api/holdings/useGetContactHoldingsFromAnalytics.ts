import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import {
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "./fragments";
import { ContactHoldingsFromAnalyticsQuery } from "./types";

/**
 * Fetching yesterday-today will provide us with the latest available snapshot
 * for today (if available), otherwise yersterday (as a fallback).
 */
const PERIOD_IN_DAYS = 1;

const CONTACT_HOLDING_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  query GetContactHolding(
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
            key: "contactHoldings"
            timePeriodCodes: "GIVEN"
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
        contact: grouppedAnalytics(key: "contactHoldings") {
          firstAnalysis {
            marketValue
            tradeAmount
          }
          ...SecurityTypeWithSecuritiesData
        }
      }
    }
  }
`;

export const useGetContactHoldingsFromAnalytics = (cacheOnly = false) => {
  const { selectedContactId } = useGetContractIdData();
  const { i18n } = useModifiedTranslation();
  const defaultPolicies = getFetchPolicyOptions(
    `useGetContactHoldingsFromAnalytics.${selectedContactId}`
  );
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - PERIOD_IN_DAYS);
  const endDate = new Date();
  const { loading, error, data } = useQuery<ContactHoldingsFromAnalyticsQuery>(
    CONTACT_HOLDING_QUERY,
    {
      variables: {
        contactId: selectedContactId,
        locale: i18n.language,
        startDate: startDate.toLocaleDateString("sv-SE"),
        endDate: endDate.toLocaleDateString("sv-SE"),
      },
      fetchPolicy: cacheOnly ? "cache-only" : defaultPolicies.fetchPolicy,
      onCompleted: cacheOnly ? undefined : defaultPolicies.onCompleted,
    }
  );
  return { loading, error, data };
};
