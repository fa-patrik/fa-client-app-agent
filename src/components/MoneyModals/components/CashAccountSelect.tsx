import { Dispatch, SetStateAction } from "react";
import { CashAccount } from "api/money/useGetPortfoliosAccounts";
import { ReactComponent as ExclamationIcon } from "assets/exclamation-circle.svg";
import { PortfolioSelect, ComboBox, LabeledDiv } from "components";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface CashAccountSelectProps {
  portfolioId: number;
  setPortfolioId: Dispatch<SetStateAction<number>>;
  portfolioOptions: PortfolioOption[];
  currentInternalCashAccount: CashAccount | undefined;
  setCurrentInternalCashAccount: Dispatch<
    SetStateAction<CashAccount | undefined>
  >;
  internalCashAccounts: CashAccount[];
  currentExternalCashAccount: CashAccount | undefined;
  setCurrentExternalCashAccount: Dispatch<
    SetStateAction<CashAccount | undefined>
  >;
  externalCashAccounts: CashAccount[];
  isDeposit: boolean;
}

export const CashAccountSelect = ({
  setPortfolioId,
  portfolioId,
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

  const fromAccount = isDeposit
    ? currentExternalCashAccount
    : currentInternalCashAccount;
  const fromOptions = isDeposit ? externalCashAccounts : internalCashAccounts;
  const toAccount = isDeposit
    ? currentInternalCashAccount
    : currentExternalCashAccount;
  const toOptions = isDeposit ? internalCashAccounts : externalCashAccounts;

  return (
    <>
      {!portfolioId && (
        <div className="flex justify-center content-center p-4 w-full rounded-lg border border-amber-600 bg-amber-50">
          <ExclamationIcon className="mr-2 stroke-amber-600" />
          <span className="text-amber-600">
            {t("moneyModal.noPortfolioAvailable")}
          </span>
        </div>
      )}
      <PortfolioSelect
        portfolioOptions={portfolioOptions}
        portfolioId={portfolioId}
        onChange={(newPortfolio) => {
          setPortfolioId(newPortfolio.id);
        }}
        label={t("moneyModal.portfolio")}
      />

      <ComboBox
        value={fromAccount}
        onChange={
          isDeposit
            ? setCurrentExternalCashAccount
            : setCurrentInternalCashAccount
        }
        options={fromOptions}
        label={t("moneyModal.fromAccount")}
      />

      <ComboBox
        value={toAccount}
        onChange={
          isDeposit
            ? setCurrentInternalCashAccount
            : setCurrentExternalCashAccount
        }
        options={toOptions}
        label={t("moneyModal.toAccount")}
      />

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
