import { MutableRefObject, useState } from "react";
import {
  PortfolioGroups,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { useDeposit } from "api/money/useDeposit";
import { useGetClientTaxAllowancesWithWrappers } from "api/taxes/useGetClientTaxAllowancesWithWrappers";
import { Input, Button, LabeledDiv, LoadingIndicator } from "components";
import Alert, { Severity } from "components/Alert/Alert";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { usePortfolioTaxAllowanceLogic } from "hooks/usePortfolioTaxAllowanceLogic";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { handleNumberInputEvent } from "utils/input";
import { getCurrentTaxYear, getCalcDateFromTaxYear } from "utils/taxYear";
import { CashAccountSelect } from "../components/CashAccountSelect";
import { useFilteredPortfolioSelect } from "../useFilteredPortfolioSelect";
import { usePortfoliosAccountsState } from "../usePortfoliosAccountsState";

interface DepositModalProps {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
  preselectedPortfolioId?: number;
}

export const DepositModalContent = ({
  onClose,
  modalInitialFocusRef,
  preselectedPortfolioId,
}: DepositModalProps) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: contactInfo } = useGetContactInfo(false, selectedContactId);
  const contactCode = contactInfo?._contactId;

  const { canPfOption } = useFeature(
    PortfolioGroups.DEPOSIT,
    RepresentativeTag.DEPOSIT,
    PermissionMode.ANY
  );
  const portfolioSelectProps = useFilteredPortfolioSelect(canPfOption, preselectedPortfolioId);
  const { portfolioId } = portfolioSelectProps;

  const currentTaxYear = getCurrentTaxYear(new Date());
  const calcDate = getCalcDateFromTaxYear(currentTaxYear);

  const { data: taxAllowanceData, loading: taxAllowanceLoading } =
    useGetClientTaxAllowancesWithWrappers({
      contactId: contactCode || "",
      calcDate,
      skip: !contactCode,
    });

  const selectedPortfolio = contactInfo?.portfolios?.find((portfolio) => portfolio.id === portfolioId) || contactInfo?.portfolios?.[0];

  const { accountsLoading, ...cashAccountSelectProps } =
    usePortfoliosAccountsState(portfolioId);
  const {
    currentInternalCashAccount: {
      availableBalance = 0,
      currency: accountCurrency = "EUR",
      label = "",
      number = "",
    } = {},
    currentExternalCashAccount: { number: externalNumber = "" } = {},
  } = cashAccountSelectProps;
  const inputBlockSize =
    cashAccountSelectProps.currentInternalCashAccount?.amountDecimalCount;
  const fallBackBlockSize = 2;
  const [amount, setAmount] = useState("");
  const amountAsNr = amount ? parseFloat(amount) : 0;

  const {
    isPortfolioTaxAdvantaged,
    remainingAllowance,
    totalAllowance,
    currency,
    hasZeroAllowance,
    isAmountOverAllowance,
  } = usePortfolioTaxAllowanceLogic({
    taxAllowanceData,
    selectedPortfolio,
  });

  const isAmountOverAllowanceFlag = isAmountOverAllowance(amountAsNr);

  const isAmountCorrect = !isNaN(availableBalance) && amountAsNr >= 0;


  const { handleTrade: handleDeposit, submitting } = useDeposit({
    portfolio: selectedPortfolio,
    tradeAmount: amountAsNr,
    securityName: label,
    account: number,
    currency: accountCurrency,
    externalAccount: externalNumber,
  });

  const { access } = useKeycloak();

  const invalidAccountSelection =
    !cashAccountSelectProps.currentInternalCashAccount ||
    !cashAccountSelectProps.currentExternalCashAccount;

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      <CashAccountSelect
        {...cashAccountSelectProps}
        {...portfolioSelectProps}
        isDeposit={true}
      />
      <hr className="mb-2" />

      {isPortfolioTaxAdvantaged && (
        <AllowanceInfo
          totalAllowance={totalAllowance}
          remainingAllowance={remainingAllowance}
          currency={currency}
          loading={taxAllowanceLoading}
        />
      )}

      {hasZeroAllowance && (
        <Alert
          id="allowance-limit-reached"
          severity={Severity.Info}
          title={t("moneyModal.allowanceLimitReached")}
        />
      )}

      <div className="flex flex-col gap-4 items-stretch ">
        <Input
          ref={modalInitialFocusRef}
          value={amount}
          disabled={hasZeroAllowance}
          onChange={(event) => {
            handleNumberInputEvent(
              event,
              setAmount,
              0,
              undefined,
              inputBlockSize || fallBackBlockSize
            );
          }}
          label={t("moneyModal.depositAmountInputLabel", {
            currency: currency,
          })}
          type="number"
          error={
            !isAmountCorrect && !accountsLoading
              ? t("moneyModal.amountInputError")
              : !accountsLoading && invalidAccountSelection
                ? t("moneyModal.invalidAccountSelection")
                : isAmountOverAllowanceFlag
                  ? t("moneyModal.amountOverAllowanceError")
                  : ""
          }
          step="any"
          endAdornment={
            isPortfolioTaxAdvantaged && !hasZeroAllowance ? (
              <button
                type="button"
                className="py-1 px-2 text-xs font-bold text-primary-600 hover:bg-gray-100 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
                aria-label="Use maximum remaining allowance"
                onClick={() => setAmount(remainingAllowance.toString())}
              >
                {t("common.max", { defaultValue: "MAX" })}
              </button>
            ) : null
          }
        />

        <Button
          disabled={
            !access.deposit ||
            !selectedPortfolio ||
            amountAsNr === 0 ||
            accountsLoading ||
            !isAmountCorrect ||
            invalidAccountSelection ||
            isAmountOverAllowanceFlag ||
            hasZeroAllowance
          }
          isLoading={submitting}
          onClick={async () => {
            const response = await handleDeposit();
            if (response) {
              onClose();
            }
          }}
        >
          {t("moneyModal.depositButtonLabel")}
        </Button>
      </div>
      <hr className="my-1" />
      <div className="text-xs text-center text-gray-600 max-w-[375px]">
        {t("moneyModal.depositDisclaimer")}
      </div>
    </div>
  );
};

interface AllowanceInfoProps {
  totalAllowance: number;
  remainingAllowance: number;
  currency: string;
  loading: boolean;
}

const AllowanceInfo = ({
  totalAllowance,
  remainingAllowance,
  currency,
  loading,
}: AllowanceInfoProps) => {
  const { t } = useModifiedTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 mb-2 divide-x">
      <LabeledDiv
        label={t("moneyModal.totalAllowanceLabel")}
        className="text-xl font-semibold text-gray-700"
      >
        {t("numberWithCurrency", { value: totalAllowance, currency })}
      </LabeledDiv>
      <LabeledDiv
        label={t("moneyModal.remainingAllowanceLabel")}
        className="text-xl font-semibold text-right text-gray-700"
      >
        {t("numberWithCurrency", { value: remainingAllowance, currency })}
      </LabeledDiv>
    </div>
  );
};
