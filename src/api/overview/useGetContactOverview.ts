import { gql, useQuery } from "@apollo/client";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import {
  SECURITY_TYPE_FRAGMENT,
  PORTFOLIO_CARD_DATA_FRAGMENT,
} from "./fragments";
import { ContactOverviewQuery } from "./types";

const CONTACT_OVERVIEW_QUERY = gql`
  ${SECURITY_TYPE_FRAGMENT}
  ${PORTFOLIO_CARD_DATA_FRAGMENT}
  query GetContactOverview($contactId: Long, $locale: Locale) {
    contact(id: $contactId) {
      id
      analytics(
        parameters: {
          paramsSet: {
            key: "contactOverview"
            timePeriodCodes: "DAYS-0"
            grouppedByProperties: [PORTFOLIO, TYPE]
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
          ...PortfolioCardData
        }
      }
    }
  }
`;

export const useGetContactOverview = () => {
  const { selectedContactId } = useGetContractIdData();
  const { i18n } = useModifiedTranslation();
  const { loading, error, data } = useQuery<ContactOverviewQuery>(
    CONTACT_OVERVIEW_QUERY,
    {
      variables: {
        contactId: selectedContactId,
        locale: i18n.language,
      },
    }
  );
  return { loading, error, data };
};
