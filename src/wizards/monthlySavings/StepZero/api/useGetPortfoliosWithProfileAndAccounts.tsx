import { gql, useQuery } from "@apollo/client";
import {
  PORTFOLIO_BASIC_FIELDS,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import type { PortfolioWithProfileAndFigures } from "api/common/useGetPortfoliosWithProfileAndFigures";
import { PORTFOLIO_EXTENDED_FIELDS } from "api/common/useGetPortfoliosWithProfileAndFigures";
import { getSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
import type {
  CashAccount,
  PortfolioAccount,
  PortfolioReportAccount,
} from "api/money/useGetPortfoliosAccounts";
import {
  ACCOUNT_CAT_EXTERNAL,
  PORTFOLIO_ACCOUNTS_FRAGMENT,
  PORTFOLIO_REPORT_ACCOUNTS_FRAGMENT,
  mapCashAccount,
} from "api/money/useGetPortfoliosAccounts";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";

//maximum of 2 sub portfolio depth
const PORTFOLIO_PROFILE_FIGURES_ACCOUNTS_QUERY = gql`
  ${PORTFOLIO_BASIC_FIELDS}
  ${PORTFOLIO_EXTENDED_FIELDS}
  ${PORTFOLIO_ACCOUNTS_FRAGMENT}
  ${PORTFOLIO_REPORT_ACCOUNTS_FRAGMENT}
  query GetPortfoliosProfileAndFiguresAndAccounts($portfolioIds: [String]) {
    portfolios(ids: $portfolioIds) {
      ...PortfolioWithProfileAndFigures
      ...PortfolioAccount
      ...PortfolioReportAccounts
    }
  }
`;

interface PortfolioProfileAndFiguresAndAccountsQuery {
  portfolios: PortfolioProfileAndFiguresAndAccounts[];
}
export interface PortfolioProfileAndFiguresAndAccounts
  extends PortfolioWithProfileAndFigures {
  accounts: PortfolioAccount[];
  portfolioReport: {
    currency: {
      securityCode: string;
    };
    accountItems: PortfolioReportAccount[];
  };
}

export const useGetPortfoliosProfileAndFiguresAndAccounts = (
  callAPI = false
) => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { data: contactData } = useGetContactInfo(
    false,
    selectedContactId || linkedContact
  );
  const portfolioIds = contactData?.portfolios.reduce((prev, curr) => {
    const subIds = getSubPortfolioIds(curr);
    prev.push(curr.id, ...subIds);
    return prev;
  }, [] as number[]);

  const { loading, error, data, refetch, networkStatus } =
    useQuery<PortfolioProfileAndFiguresAndAccountsQuery>(
      PORTFOLIO_PROFILE_FIGURES_ACCOUNTS_QUERY,
      {
        variables: {
          portfolioIds: portfolioIds,
        },
        fetchPolicy: callAPI ? "cache-and-network" : "cache-first",
        notifyOnNetworkStatusChange: true,
      }
    );

  return {
    loading: loading,
    networkStatus,
    error: error,
    data: data,
    refetch,
  };
};

/**
 * Gets the accounts with category "External".
 * These are treated as 'debit' accounts by the backend.
 */
export const getUniqueExternalAccounts = (
  portfolioReportAccounts: PortfolioReportAccount[],
  portfolioAccounts: PortfolioAccount[]
) => {
  const externalPortfolioReportAccounts = portfolioReportAccounts.filter(
    (a) => a.account?.category === ACCOUNT_CAT_EXTERNAL
  );
  const externalPortfolioAccounts = portfolioAccounts.filter(
    (a) => a.category === ACCOUNT_CAT_EXTERNAL
  );
  const allExternalAccounts = [
    ...externalPortfolioAccounts,
    ...externalPortfolioReportAccounts,
  ];

  const externalAccountMap = allExternalAccounts.reduce(
    (prev, currAcc) => {
      if (currAcc.accountId !== null) {
        prev[currAcc.accountId] ??= mapCashAccount(currAcc);
      }
      return prev;
    },
    {} as Record<number, CashAccount>
  );

  const uniqueExternalAccounts = Object.values(externalAccountMap);
  return uniqueExternalAccounts;
};
