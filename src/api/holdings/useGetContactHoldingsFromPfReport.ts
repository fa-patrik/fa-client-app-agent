import { gql, useQuery } from "@apollo/client";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS } from "./fragments";
import { ContactHoldingDetailsQuery } from "./types";

const CONTACT_HOLDING_DETAILS_QUERY = gql`
  ${PORTFOLIO_REPORT_HOLDINGS_DETAILS_FIELDS}
  query GetPortfoliosHoldingsFromPfReport($contactId: Long) {
    contact(id: $contactId) {
      id
      portfolios {
        id
        portfolioReport {
          portfolioId
          ...PortfolioReportHoldingDetailsFields
        }
      }
    }
  }
`;

/**
 * Gets all holdings from portfolioReport.
 * @param portfolioId the portfolio to get holdings from
 * @param pollInterval optional, how often (ms) to poll the server for fresh data
 * @returns the holdings in the portfolio
 */
export const useGetContactHoldingsFromPfReport = (pollInterval?: number) => {
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data, refetch, networkStatus } =
    useQuery<ContactHoldingDetailsQuery>(CONTACT_HOLDING_DETAILS_QUERY, {
      variables: {
        contactId: selectedContactId,
      },
      pollInterval: pollInterval ?? undefined,
      notifyOnNetworkStatusChange: true,
    });

  return {
    loading,
    error,
    data: data?.contact,
    refetch,
    networkStatus,
  };
};
