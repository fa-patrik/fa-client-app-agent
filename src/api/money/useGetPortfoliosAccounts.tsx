import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { formatValidIban } from "../../utils/iban";

const CASH_ACCOUNTS_QUERY = gql`
  query GetCashAccounts($portfolioId: Long) {
    portfolio(id: $portfolioId) {
      id
      accounts{
          accountId: id
          accountName: name
          number
          currency {
            securityCode
          }
          cashAccount
          category
      }
      portfolioReport {
        portfolioId
        accountItems {
          accountName
          currency {
            securityCode
          }
          account {
            cashAccount
            category
          }
          accountId
          amountAfterOpenTradeOrders
          balance
          number: key
        }
      }
    }
  }
`;

const ACCOUNT_CAT_INTERNAL = "Internal";
const ACCOUNT_CAT_EXTERNAL = "External";

//An account object from a portfolio report's account item
//It is possible that the accountId and account are null
interface PortfolioReportAccount {
  accountName: string;
  currency: {
    securityCode: string;
  };
  accountId: number | null;
  amountAfterOpenTradeOrders: number;
  balance: number;
  number: string;
  account: {
    cashAccount: boolean;
    category: string;
  } | null;
}

//An account object from the portfolio's accounts
interface PortfolioAccount {
  accountId: number;
  accountName: string;
  number: string;
  currency: {
    securityCode: string;
  }
  cashAccount: boolean;
  balance: number;
  amountAfterOpenTradeOrders: number;
  category: string;
}

interface PortfolioCashAccountsQuery {
  portfolio: {
    accounts: PortfolioAccount[];
    portfolioReport: {
      currency: {
        securityCode: string;
      };
      accountItems: PortfolioReportAccount[];
    };
  };
}

export interface CashAccount {
  id: number;
  label: string;
  number: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
}

const mapCashAccount = (account: PortfolioReportAccount | PortfolioAccount): CashAccount => ({
  id: account.accountId ?? -1,
  label: formatValidIban(account.number),
  number: account.number,
  currency: account.currency.securityCode,
  currentBalance: account.balance ?? 0,
  availableBalance: account.amountAfterOpenTradeOrders ?? 0,
});

export const useGetPortfoliosAccounts = (portfolioId?: string) => {
  const { loading, error, data } = useQuery<PortfolioCashAccountsQuery>(
    CASH_ACCOUNTS_QUERY,
    {
      variables: {
        portfolioId,
      },
      skip: !portfolioId,
      fetchPolicy: "network-only",
    }
  );

  return {
    loading,
    error,
    data: useMemo(
      () => {
        if(!data) return undefined;

        const filteredCashAccounts = filterCashAccountsByCategory(
          data.portfolio.portfolioReport.accountItems || [],
          data.portfolio.accounts || [] )

        const internalCashAccounts = filteredCashAccounts.internal?.map(mapCashAccount);

        const externalCashAccounts = filteredCashAccounts.external?.map(mapCashAccount);

        const uncategorizedCashAccounts = filteredCashAccounts.uncategorized?.map(mapCashAccount);

        if(internalCashAccounts.length > 0 && externalCashAccounts.length > 0) {
          return {
            internalCashAccounts: internalCashAccounts,
            externalCashAccounts: externalCashAccounts,
          }
        } else {
          return {
            internalCashAccounts: [...internalCashAccounts, ...externalCashAccounts, ...uncategorizedCashAccounts],
            externalCashAccounts: [],
          }
        }

      },
      [data]
    ),
  };
};

/**
 * Gets the sets of accounts that are cash accounts. Grouped by category (internal, external, others).
 * @param portfolioReportAccounts portfolio accounts with at least one transaction.
 * @param portfolioAccounts all portfolio accounts (incl. those without transactions).
 * @returns the set of accounts that are categorized as cash accounts from portfolioReportAccounts and portfolioAccounts.
 */
const filterCashAccountsByCategory = (
  portfolioReportAccounts: PortfolioReportAccount[],
  portfolioAccounts: PortfolioAccount[],
) => {
  const internalCashAccounts: (PortfolioReportAccount | PortfolioAccount)[] = [];
  const externalCashAccounts: (PortfolioReportAccount | PortfolioAccount)[] = [];
  const uncategorizedCashAccounts: (PortfolioReportAccount | PortfolioAccount)[] = [];

  portfolioReportAccounts.forEach(reportAccount => {
    if(reportAccount.account?.cashAccount) {
      if(reportAccount.account?.category === ACCOUNT_CAT_INTERNAL) {
        internalCashAccounts.push(reportAccount);
      } else if(reportAccount.account?.category === ACCOUNT_CAT_EXTERNAL) {
        externalCashAccounts.push(reportAccount);
      } else {
        uncategorizedCashAccounts.push(reportAccount);
      }
    }
  });
  portfolioAccounts.forEach(account => {
    if(account.cashAccount && ![...internalCashAccounts, ...externalCashAccounts, ...uncategorizedCashAccounts].some(reportAccount => reportAccount?.accountId === account.accountId) ) {
      if(account.category === ACCOUNT_CAT_INTERNAL) {
        internalCashAccounts.push(account);
      } else if(account.category === ACCOUNT_CAT_EXTERNAL) {
        externalCashAccounts.push(account);
      } else {
        uncategorizedCashAccounts.push(account);
      }
    }
  });

  return { internal: internalCashAccounts, external: externalCashAccounts, uncategorized: uncategorizedCashAccounts };
}

