import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  LimitedSwitchBuyOrderDTOInput,
  LimitedSwitchOrderDTOInput,
  LimitedSwitchOrderResponseDTO,
  LimitedTradeOrderDTOInput,
} from "api/types";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";

const IMPORT_SWITCH_MUTATION = gql`
  mutation ImportSwitch(
    $sell: LimitedTradeOrderDTOInput!
    $buy: LimitedSwitchBuyOrderDTOInput!
  ) {
    importSwitchOrder(switchOrder: { sell: $sell, buy: $buy }) {
      sell {
        account
        amount
        currency
        executionMethod
        extId
        fxRate
        parentPortfolio
        reference
        security
        settlementDate
        status
        tradeAmount
        transactionDate
        type
        unitPrice
      }
      buy {
        account
        amount
        currency
        executionMethod
        extId
        fxRate
        parentPortfolio
        reference
        security
        settlementDate
        status
        tradeAmount
        transactionDate
        type
        unitPrice
      }
    }
  }
`;

interface ImportSwitchVariables {
  sell: LimitedTradeOrderDTOInput;
  buy: LimitedSwitchBuyOrderDTOInput;
}

export const useSwitch = (switchOrder: LimitedSwitchOrderDTOInput) => {
  const [submitting, setSubmitting] = useState(false);
  const { t } = useModifiedTranslation();
  const [createSwitch, { error, data }] = useMutation<
    LimitedSwitchOrderResponseDTO,
    ImportSwitchVariables
  >(IMPORT_SWITCH_MUTATION);

  const handleCreateSwitch = async () => {
    setSubmitting(true);
    try {
      const apiResponse = await createSwitch({
        variables: {
          sell: switchOrder.sell,
          buy: switchOrder.buy,
        },
      });
      setSubmitting(false);
      toast.success(t("messages.createSwitchSuccess"), { autoClose: 3000 });
      return apiResponse;
    } catch (e: unknown) {
      toast.error(t("messages.createSwitchFailed"), { autoClose: 3000 });
      setSubmitting(false);
      return null;
    }
  };

  return {
    handleCreateSwitch,
    loading: submitting,
    error,
    data,
  };
};
