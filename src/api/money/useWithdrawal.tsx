import { useState } from "react";
import { ApolloError, FetchResult, gql, useMutation } from "@apollo/client";
import { ADVISOR_TAG } from "api/constants";
import { OrderStatus } from "api/enums";
import { OrderMutationResponse } from "api/orders/types";
import { TransactionType } from "api/transactions/enums";
import {
  LocalTradeOrderDetails,
  useLocalTradeStorageMutation,
} from "hooks/useLocalTradeStorageMutation";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useUniqueReference } from "hooks/useUniqueReference";
import { useKeycloak } from "providers/KeycloakProvider";
import { toast } from "react-toastify";

const IMPORT_WITHDRAWAL_MUTATION = gql`
  mutation ImportWithdrawal(
    $tradeAmount: String
    $currency: String
    $reference: String
    $transactionDate: String
    $transactionTypeCode: String
    $portfolioShortName: String
    $account: String
    $intInfo: String
    $tags: String
  ) {
    importTradeOrder(
      tradeOrder: {
        tradeAmount: $tradeAmount
        currency: $currency
        reference: $reference
        transactionDate: $transactionDate
        type: $transactionTypeCode
        parentPortfolio: $portfolioShortName
        account: $account
        status: "${OrderStatus.Open}"
        intInfo: $intInfo
        tags: $tags
      }
    )
  }
`;

interface ImportTradeOrderQueryVariables {
  currency: string;
  portfolioShortName: string;
  reference: string;
  account: string;
  tradeAmount: number;
  transactionDate: Date;
  transactionTypeCode: string;
  intInfo: string | null;
  tags?: string;
}

const errorStatus = "ERROR" as const;

export const withdrawalType = "withdrawal" as const;

export const useWithdrawal = (
  newOrder: Omit<
    ImportTradeOrderQueryVariables,
    | "transactionTypeCode"
    | "transactionDate"
    | "reference"
    | "portfolioShortName"
  > &
    Omit<LocalTradeOrderDetails, "tradeType" | "reference">
) => {
  const { access } = useKeycloak();
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleAPITrade] = useMutation<
    OrderMutationResponse,
    ImportTradeOrderQueryVariables
  >(IMPORT_WITHDRAWAL_MUTATION, {
    refetchQueries: ["GetAllPortfoliosTradeOrders", "GetPortfolioTradeOrders"],
  });

  const saveToLocalTradeOrders = useLocalTradeStorageMutation();
  const getUniqueReference = useUniqueReference();

  const handleTrade = async () => {
    setSubmitting(true);
    try {
      const { portfolio, account } = newOrder;
      if (!portfolio || !account) {
        return;
      }
      const orderReference = getUniqueReference();

      const apiResponse = await handleAPITrade({
        variables: {
          ...newOrder,
          transactionDate: new Date(),
          transactionTypeCode: TransactionType.WITHDRAWAL,
          reference: orderReference,
          portfolioShortName: portfolio.shortName,
          tags: access.advisor ? ADVISOR_TAG : undefined,
        },
      });

      handleBadAPIResponse(apiResponse);

      await saveToLocalTradeOrders({
        ...newOrder,
        tradeType: withdrawalType,
        reference: orderReference,
      });

      setSubmitting(false);
      toast.success(t("moneyModal.withdrawalSuccess"), { autoClose: 3000 });
      return apiResponse;
    } catch (e: unknown) {
      const error = e as Error | ApolloError;
      toast.error(error.message, {
        style: { whiteSpace: "pre-line" },
      });
      setSubmitting(false);
      return null;
    }
  };

  return { handleTrade, submitting };
};

const handleBadAPIResponse = (
  apiResponse: FetchResult<
    OrderMutationResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data?.importTradeOrder?.[0]) {
    throw new Error("Empty response");
  }

  if (apiResponse.data.importTradeOrder[0]?.importStatus === errorStatus) {
    let errorMessage = "Bad request: \n";
    Object.entries(apiResponse.data.importTradeOrder[0]).forEach(
      ([key, value]) => {
        if (value.includes("ERROR") && key !== "importStatus") {
          errorMessage += `${key}: ${value}; \n`;
        }
      }
    );
    throw new Error(errorMessage);
  }
};
