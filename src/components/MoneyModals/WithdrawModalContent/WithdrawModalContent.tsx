import { MutableRefObject, useState } from "react";
import {
  PortfolioGroups,
  RepresentativeTag,
  useGetContactInfo,
} from "api/common/useGetContactInfo";
import { useWithdrawal } from "api/money/useWithdrawal";
import { Input, Button } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { handleNumberInputEvent } from "utils/input";
import { CashAccountSelect } from "../components/CashAccountSelect";
import { useFilteredPortfolioSelect } from "../useFilteredPortfolioSelect";
import { usePortfoliosAccountsState } from "../usePortfoliosAccountsState";

interface WithdrawModalProps {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

export const WithdrawModalContent = ({
  onClose,
  modalInitialFocusRef,
}: WithdrawModalProps) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const { canPfOption: canPfOptionWithdraw } = useFeature(
    PortfolioGroups.WITHDRAW,
    RepresentativeTag.WITHDRAW,
    PermissionMode.ANY
  );

  const portfolioSelectProps = useFilteredPortfolioSelect(canPfOptionWithdraw);
  const { portfolioId } = portfolioSelectProps;
  const { accountsLoading, ...cashAccountSelectProps } =
    usePortfoliosAccountsState(portfolioId);
  const {
    currentInternalCashAccount: {
      availableBalance = 0,
      currency = "EUR",
      label = "",
      number = "",
    } = {},
    currentExternalCashAccount: { number: externalNumber = "" } = {},
  } = cashAccountSelectProps;

  const [amount, setAmount] = useState("");
  const amountAsNr = amount ? parseFloat(amount) : 0;
  const inputBlockSize =
    cashAccountSelectProps.currentInternalCashAccount?.amountDecimalCount;
  const fallBackBlockSize = 2;
  const isAmountCorrect =
    !isNaN(availableBalance) &&
    amountAsNr >= 0 &&
    amountAsNr <= availableBalance;

  const { handleTrade: handleWithdraw, submitting } = useWithdrawal({
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    tradeAmount: amountAsNr,
    securityName: label,
    account: number,
    currency,
    externalAccount: externalNumber,
  });

  const { access } = useKeycloak();

  const invalidAccountSelection =
    cashAccountSelectProps.currentInternalCashAccount === undefined ||
    cashAccountSelectProps.currentExternalCashAccount === undefined;

  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      <CashAccountSelect
        {...cashAccountSelectProps}
        {...portfolioSelectProps}
        isDeposit={false}
      />
      <hr className="mb-2" />
      <div className="flex flex-col gap-4 items-stretch ">
        <Input
          ref={modalInitialFocusRef}
          value={amount || ""}
          onChange={(event) => {
            handleNumberInputEvent(
              event,
              setAmount,
              0,
              undefined,
              inputBlockSize || fallBackBlockSize
            );
          }}
          label={t("moneyModal.withdrawalAmountInputLabel", {
            currency,
          })}
          type="number"
          error={
            !isAmountCorrect && !accountsLoading
              ? t("moneyModal.amountInputError")
              : !accountsLoading && invalidAccountSelection
              ? t("moneyModal.invalidAccountSelection")
              : ""
          }
          step="any"
        />
        <Button
          disabled={
            !access.withdraw ||
            amountAsNr === 0 ||
            accountsLoading ||
            !isAmountCorrect ||
            invalidAccountSelection
          }
          isLoading={submitting}
          onClick={async () => {
            const response = await handleWithdraw();
            if (response) {
              onClose();
            }
          }}
        >
          {t("moneyModal.withdrawButtonLabel")}
        </Button>
      </div>
      <hr className="my-1" />
      <div className="text-xs text-center text-gray-600 max-w-[375px]">
        {t("moneyModal.withdrawDisclaimer")}
      </div>
    </div>
  );
};
