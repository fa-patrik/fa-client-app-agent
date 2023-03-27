import { gql, useQuery } from "@apollo/client";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useGetContactInfo } from "../initial/useGetContactInfo";
import { ALLOCATION_BY_SECURITY_TYPE_FIELDS } from "./fragments";
import { AllPortfoliosHoldingsQuery } from "./types";

// to distinct Contact analytics from Portfolio analytics in Contact version we set portfolio.id as portfolio.parentPortfolioId (line 32)
const HOLDINGS_QUERY = gql`
  ${ALLOCATION_BY_SECURITY_TYPE_FIELDS}
  query GetHoldings($contactId: Long, $locale: Locale) {
    contact(id: $contactId) {
      id
      analytics(
        parameters: {
          paramsSet: {
            key: "allHoldingsByTypeBySecurity"
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
        allocationTopLevel: grouppedAnalytics(
          key: "allHoldingsByTypeBySecurity"
        ) {
          portfolio {
            id: parentPortfolioId
          }
          ...AllocationBySecurityTypeFields
        }
      }
    }
  }
`;

export const useGetAllPortfoliosHoldings = () => {
  const { selectedContactId } = useGetContractIdData();
  const { i18n } = useModifiedTranslation();
  const { data: { portfoliosCurrency } = { portfoliosCurrency: "EUR" } } =
    useGetContactInfo(false, selectedContactId);
  const { loading, error, data } = useQuery<AllPortfoliosHoldingsQuery>(
    HOLDINGS_QUERY,
    {
      variables: {
        contactId: selectedContactId,
        locale: i18n.language,
      },
    }
  );

  return {
    loading,
    error,
    data: data && {
      allocationByType:
        data.contact.analytics.allocationTopLevel.allocationByType,
      // there is no way to get currency for analytics under contact context,
      // but all portfolios have same currency, so we use currency from first one
      currency: portfoliosCurrency,
    },
  };
};
