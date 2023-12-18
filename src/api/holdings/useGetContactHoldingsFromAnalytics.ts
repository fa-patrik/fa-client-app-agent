import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import {
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "./fragments";
import { ContactHoldingsFromAnalyticsQuery } from "./types";

const CONTACT_HOLDING_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  query GetContactHolding($contactId: Long, $locale: Locale) {
    contact(id: $contactId) {
      id
      analytics(
        parameters: {
          paramsSet: {
            key: "contactHoldings"
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
  const { loading, error, data } = useQuery<ContactHoldingsFromAnalyticsQuery>(
    CONTACT_HOLDING_QUERY,
    {
      variables: {
        contactId: selectedContactId,
        locale: i18n.language,
      },
      fetchPolicy: cacheOnly ? "cache-only" : defaultPolicies.fetchPolicy,
      onCompleted: cacheOnly ? undefined : defaultPolicies.onCompleted,
    }
  );
  return { loading, error, data };
};
