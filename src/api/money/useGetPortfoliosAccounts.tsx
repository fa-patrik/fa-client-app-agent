import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

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
  label: account.accountName,
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
      () =>
        data && {
          cashAccounts: filterAccounts(
            data.portfolio.portfolioReport.accountItems || [],
            data.portfolio.accounts || []
          )?.map(mapCashAccount),
        },
      [data]
    ),
  };
};

/**
 * Gets the set of accounts that are categorized as cash accounts. 
 * @param portfolioReportAccounts portfolio accounts with at least one transaction.
 * @param portfolioAccounts all portfolio accounts (incl. those without transactions).
 * @returns the set of accounts that are categorized as cash accounts from portfolioReportAccounts and portfolioAccounts.
 */
const filterAccounts = (
  portfolioReportAccounts: PortfolioReportAccount[],
  portfolioAccounts: PortfolioAccount[]
) => {
  const portfolioReportCashAccounts = portfolioReportAccounts.filter(reportAccount => reportAccount.account?.cashAccount);
  const portfolioCashAccountsNotInReportAccounts = portfolioAccounts.filter(portfolioAccount => {
    return (
      !portfolioReportCashAccounts.some(reportAccount => reportAccount?.accountId === portfolioAccount.accountId) &&
      portfolioAccount.cashAccount
    )
  })
  return [...portfolioReportCashAccounts, ...portfolioCashAccountsNotInReportAccounts]
}

