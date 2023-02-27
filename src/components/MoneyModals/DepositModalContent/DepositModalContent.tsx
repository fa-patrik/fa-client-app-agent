import { MutableRefObject, useState } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { useDeposit } from "api/money/useDeposit";
import { Input, Button } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useIsReadOnly } from "services/permissions/readOnly";
import { CashAccountSelect } from "../components/CashAccountSelect";
import { usePortfoliosAccountsState } from "../usePortfoliosAccountsState";
import { useDepositablePortfolioSelect } from "./useDepositablePortfolioSelect";

interface DepositModalProps {
  modalInitialFocusRef: MutableRefObject<null>;
  onClose: () => void;
}

export const DepositModalContent = ({
  onClose,
  modalInitialFocusRef,
}: DepositModalProps) => {
  const { t } = useModifiedTranslation();
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  const portfolioSelectProps = useDepositablePortfolioSelect();
  const { portfolioId } = portfolioSelectProps;

  const { accountsLoading, ...cashAccountSelectProps } =
    usePortfoliosAccountsState(portfolioId);
  const {
    currentCashAccount: {
      availableBalance = 0,
      currency = "EUR",
      label = "",
      number = "",
    } = {},
  } = cashAccountSelectProps;

  const [amount, setAmount] = useState(0);

  const isAmountCorrect = !isNaN(availableBalance) && amount >= 0;

  const { handleTrade: handleDeposit, submitting } = useDeposit({
    portfolio:
      portfolios.find((portfolio) => portfolio.id === portfolioId) ||
      portfolios[0],
    tradeAmount: amount,
    securityName: label,
    account: number,
    currency,
  });

  const isReadOnlyMode = useIsReadOnly();
  return (
    <div className="grid gap-2 min-w-[min(84vw,_375px)]">
      <CashAccountSelect
        {...cashAccountSelectProps}
        {...portfolioSelectProps}
        accountSelectLabel={t("moneyModal.toAccount")}
      />
      <hr className="mb-2" />
      <div className="flex flex-col gap-4 items-stretch ">
        <Input
          ref={modalInitialFocusRef}
          value={amount || ""}
          onChange={(event) => {
            setAmount(Number(event.currentTarget.value));
          }}
          label={t("moneyModal.depositAmountInputLabel", {
            currency: currency,
          })}
          type="number"
          error={
            !isAmountCorrect && !accountsLoading
              ? t("moneyModal.amountInputError")
              : undefined
          }
        />
        <Button
          disabled={
            isReadOnlyMode ||
            amount === 0 ||
            accountsLoading ||
            !isAmountCorrect
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
