import { useState } from "react";
import { ApolloError, FetchResult, gql, useMutation } from "@apollo/client";
import { TransactionType } from "api/transactions/enums";
import {
  LocalTradeOrderDetails,
  useLocalTradeStorageMutation,
} from "hooks/useLocalTradeStorageMutation";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useUniqueReference } from "hooks/useUniqueReference";
import { toast } from "react-toastify";

const IMPORT_DEPOSIT_MUTATION = gql`
  mutation ImportDeposit(
    $tradeAmount: String
    $currency: String
    $reference: String
    $transactionDate: String
    $transactionTypeCode: String
    $portfolioShortName: String
    $account: String
    $intInfo: String
  ) {
    importTransaction(
      transaction: {
        tradeAmount: $tradeAmount
        currency: $currency
        reference: $reference
        transactionDate: $transactionDate
        type: $transactionTypeCode
        parentPortfolio: $portfolioShortName
        account: $account
        status: "NF"
        intInfo: $intInfo
      }
    )
  }
`;

interface ImportDepositQueryVariables {
  currency: string;
  portfolioShortName: string;
  reference: string;
  account: string;
  tradeAmount: number;
  transactionDate: Date;
  transactionTypeCode: string;
  intInfo: string | null;
}

const errorStatus = "ERROR" as const;

interface ImportDepositQueryResponse {
  importTransaction: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

export const depositType = "deposit" as const;

export const useDeposit = (
  newTransaction: Omit<
    ImportDepositQueryVariables,
    | "transactionTypeCode"
    | "transactionDate"
    | "reference"
    | "portfolioShortName"
  > &
    Omit<LocalTradeOrderDetails, "tradeType" | "reference">
) => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleAPITrade] = useMutation<
    ImportDepositQueryResponse,
    ImportDepositQueryVariables
  >(IMPORT_DEPOSIT_MUTATION, {
    refetchQueries: ["GetAllPortfoliosTradeOrders", "GetPortfolioTradeOrders"],
  });

  const saveToLocalTradeOrders = useLocalTradeStorageMutation();
  const getUniqueReference = useUniqueReference();

  const handleTrade = async () => {
    setSubmitting(true);
    try {
      const { portfolio, account } = newTransaction;
      if (!portfolio || !account) {
        return;
      }
      const transactionReference = getUniqueReference();

      const apiResponse = await handleAPITrade({
        variables: {
          ...newTransaction,
          transactionDate: new Date(),
          transactionTypeCode: TransactionType.DEPOSIT,
          reference: transactionReference,
          portfolioShortName: portfolio.shortName,
        },
      });

      handleBadAPIResponse(apiResponse);

      await saveToLocalTradeOrders({
        ...newTransaction,
        tradeType: depositType,
        reference: transactionReference,
      });

      setSubmitting(false);
      toast.success(t("moneyModal.depositSuccess"), { autoClose: 3000 });
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
    ImportDepositQueryResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data || !apiResponse.data.importTransaction?.[0]) {
    throw new Error("Empty response");
  }

  if (apiResponse.data.importTransaction[0].importStatus === errorStatus) {
    let errorMessage = "Bad request: \n";
    Object.entries(apiResponse.data.importTransaction[0]).forEach(
      ([key, value]) => {
        if (value.includes("ERROR") && key !== "importStatus") {
          errorMessage += `${key}: ${value}; \n`;
        }
      }
    );
    throw new Error(errorMessage);
  }
};
