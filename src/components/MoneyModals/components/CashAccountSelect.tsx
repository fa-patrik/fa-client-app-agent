import { Dispatch, SetStateAction } from "react";
import { CashAccount } from "api/money/useGetPortfoliosAccounts";
import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import { PortfolioSelect, Select, LabeledDiv } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { PortfolioOption } from "layouts/PortfolioNavigationHeaderLayout/PortfolioNavigationHeader/PortfolioNavigationHeader";

interface CashAccountSelectProps {
  portfolioId: number;
  setPortfolioId: Dispatch<SetStateAction<number>>;
  portfolioOptions: PortfolioOption[];
  currentInternalCashAccount: CashAccount | undefined;
  setCurrentInternalCashAccount: Dispatch<SetStateAction<CashAccount | undefined>>;
  internalCashAccounts: CashAccount[];
  currentExternalCashAccount: CashAccount | undefined;
  setCurrentExternalCashAccount: Dispatch<SetStateAction<CashAccount | undefined>>;
  externalCashAccounts: CashAccount[];
  isDeposit: boolean;
}

export const CashAccountSelect = ({
  portfolioId,
  setPortfolioId,
  portfolioOptions,
  currentInternalCashAccount,
  setCurrentInternalCashAccount,
  internalCashAccounts,
  currentExternalCashAccount,
  setCurrentExternalCashAccount,
  externalCashAccounts,
  isDeposit,
}: CashAccountSelectProps) => {
  const { t } = useModifiedTranslation();
  const {
    currentBalance: currentInternalBalance = 0,
    availableBalance: availableInternalBalance = 0,
    currency: internalCurrency = "EUR",
  } = currentInternalCashAccount || {};

  return (
    <>
      {!portfolioId && 
        <div className="flex justify-center content-center p-4 w-full rounded-lg border border-amber-600 bg-amber-50">
          <ExclamationIcon className="mr-2 stroke-amber-600" />
          <span className="text-amber-600">{t("moneyModal.noPortfolioAvailable")}</span>
        </div>
      }

      <PortfolioSelect
        portfolioOptions={portfolioOptions}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => {
          setPortfolioId(newPortfolio.id);
        }}
        label={t("moneyModal.portfolio")}
      />

      {(!isDeposit || externalCashAccounts.length > 1) &&
          // Selection for the "from" account; that means external account, if it's a deposit, and internal account, if it's a withdrawal.
          // For withdrawals, the selection is shown always. For deposits, we don't want to show the selection if there
          // are no selections to be made for external accounts (i.e. there's one or zero of them).
          <Select
              value={isDeposit ? currentExternalCashAccount : currentInternalCashAccount}
              onChange={isDeposit ? setCurrentExternalCashAccount : setCurrentInternalCashAccount}
              options={isDeposit ? externalCashAccounts : internalCashAccounts}
              label={t("moneyModal.fromAccount")}
          />
      }

      {(isDeposit || externalCashAccounts.length > 1) &&
          // Selection for the "to" account; that means internal account, if it's a deposit, and external account, if it's a withdrawal.
          // For deposits, the selection is shown always. For withdrawals, we don't want to show the selection if there
          // are no selections to be made for internal accounts (i.e. there's one or zero of them).
          <Select
              value={isDeposit ? currentInternalCashAccount : currentExternalCashAccount}
              onChange={isDeposit ? setCurrentInternalCashAccount : setCurrentExternalCashAccount}
              options={isDeposit ? internalCashAccounts : externalCashAccounts}
              label={t("moneyModal.toAccount")}
          />
      }
      <div className="grid grid-cols-2 divide-x">
        <LabeledDiv
          label={t("moneyModal.currentBalance")}
          className="text-xl font-semibold text-gray-700"
        >
          {t("numberWithCurrency", {
            value: currentInternalBalance,
            currency: internalCurrency,
          })}
        </LabeledDiv>
        <LabeledDiv
          label={t("moneyModal.availableBalance")}
          className="text-xl font-semibold text-right text-gray-700"
        >
          {t("numberWithCurrency", {
            value: availableInternalBalance,
            currency: internalCurrency,
          })}
        </LabeledDiv>
      </div>
    </>
  );
};
