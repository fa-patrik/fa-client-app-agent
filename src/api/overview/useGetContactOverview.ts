import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import {
  PORTFOLIO_DATA_FRAGMENT,
  SECURITY_DATA_FRAGMENT,
  SECURITY_TYPE_WITH_SECURITIES_FRAGMENT,
} from "./fragments";
import { ContactOverviewQuery } from "./types";

const CONTACT_OVERVIEW_QUERY = gql`
  ${SECURITY_DATA_FRAGMENT}
  ${SECURITY_TYPE_WITH_SECURITIES_FRAGMENT}
  ${PORTFOLIO_DATA_FRAGMENT}
  query GetContactOverview($contactId: Long, $locale: Locale) {
    contact(id: $contactId) {
      id
      analytics(
        parameters: {
          paramsSet: {
            key: "contactOverview"
            timePeriodCodes: "DAYS-0"
            grouppedByProperties: [PORTFOLIO, TYPE, SECURITY]
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
  const { loading, error, data } = useQuery<ContactOverviewQuery>(
    CONTACT_OVERVIEW_QUERY,
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
