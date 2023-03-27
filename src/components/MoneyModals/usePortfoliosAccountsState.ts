import { useEffect, useState } from "react";
import {
  CashAccount,
  useGetPortfoliosAccounts,
} from "api/money/useGetPortfoliosAccounts";

export const usePortfoliosAccountsState = (portfolioId?: number) => {
  const { data: { internalCashAccounts = [], externalCashAccounts = [] } = {}, loading } =
    useGetPortfoliosAccounts(portfolioId?.toString());

  useEffect(() => {
    if (internalCashAccounts.length > 0) {
      setCurrentInternalCashAccount(internalCashAccounts[0]);
    }
  }, [internalCashAccounts]);
  useEffect(() => {
    if (externalCashAccounts.length > 0) {
      setCurrentExternalCashAccount(externalCashAccounts[0]);
    }
  }, [externalCashAccounts]);
  const [currentInternalCashAccount, setCurrentInternalCashAccount] = useState<CashAccount>();
  const [currentExternalCashAccount, setCurrentExternalCashAccount] = useState<CashAccount>();

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
