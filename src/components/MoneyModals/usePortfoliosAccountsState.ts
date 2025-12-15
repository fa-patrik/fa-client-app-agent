import { useEffect, useState } from "react";
import type { CashAccount } from "api/money/useGetPortfoliosAccounts";
import { useGetPortfoliosAccounts } from "api/money/useGetPortfoliosAccounts";

export const usePortfoliosAccountsState = (portfolioId?: number) => {
  const {
    data: { internalCashAccounts = [], externalCashAccounts = [] } = {},
    loading,
  } = useGetPortfoliosAccounts(portfolioId?.toString());

  useEffect(() => {
    setCurrentInternalCashAccount(internalCashAccounts[0]);
  }, [internalCashAccounts]);
  useEffect(() => {
    setCurrentExternalCashAccount(externalCashAccounts[0]);
  }, [externalCashAccounts]);

  const [currentInternalCashAccount, setCurrentInternalCashAccount] =
    useState<CashAccount>();
  const [currentExternalCashAccount, setCurrentExternalCashAccount] =
    useState<CashAccount>();

  return {
    currentInternalCashAccount,
    setCurrentInternalCashAccount,
    internalCashAccounts,
    currentExternalCashAccount,
    setCurrentExternalCashAccount,
    externalCashAccounts,
    accountsLoading: loading,
  };
};
