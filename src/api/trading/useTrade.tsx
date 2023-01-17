import { useState } from "react";
import { ApolloError, FetchResult, gql, useMutation } from "@apollo/client";
import {
  LocalTradeOrderDetails,
  useLocalTradeStorageMutation,
} from "hooks/useLocalTradeStorageMutation";
import { toast } from "react-toastify";
import { useUniqueReference } from "../../hooks/useUniqueReference";

const IMPORT_TRADE_ORDER_MUTATION = gql`
  mutation ImportTradeOrder(
    $portfolioShortName: String
    $transactionDate: String
    $securityCode: String
    $transactionTypeCode: String
    $units: String
    $tradeAmount: String
    $currency: String
    $reference: String
  ) {
    importTradeOrder(
      tradeOrder: {
        parentPortfolio: $portfolioShortName
        transactionDate: $transactionDate
        security: $securityCode
        type: $transactionTypeCode
        status: "4"
        amount: $units
        tradeAmount: $tradeAmount
        unitPrice: "AUTO"
        currency: $currency
        reference: $reference
      }
    )
  }
`;

interface ImportTradeOrderQueryVariables {
  portfolioShortName: string;
  transactionDate: Date;
  securityCode: string;
  transactionTypeCode: string;
  currency: string;
  reference: string;
  units?: number;
  tradeAmount?: number;
}

const errorStatus = "ERROR" as const;

interface ImportTradeOrderQueryResponse {
  importTradeOrder: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

export type TradeType = "sell" | "buy" | "redemption" | "subscription";

export const useTrade = (
  newTradeOrder: Omit<
    ImportTradeOrderQueryVariables,
    | "transactionTypeCode"
    | "transactionDate"
    | "reference"
    | "portfolioShortName"
  > &
    Omit<LocalTradeOrderDetails, "tradeType" | "reference"> & {
      tradeType: TradeType;
    }
) => {
  const [submitting, setSubmitting] = useState(false);
  const [handleAPITrade] = useMutation<
    ImportTradeOrderQueryResponse,
    ImportTradeOrderQueryVariables
  >(IMPORT_TRADE_ORDER_MUTATION);

  const saveToLocalTradeOrders = useLocalTradeStorageMutation();
  const getUniqueReference = useUniqueReference();

  const handleTrade = async () => {
    setSubmitting(true);
    try {
      const { tradeType, portfolio } = newTradeOrder;
      if (!portfolio) {
        return;
      }
      const transactionReference = getUniqueReference();

      const apiResponse = await handleAPITrade({
        variables: {
          ...newTradeOrder,
          transactionDate: new Date(),
          transactionTypeCode: getTradeTypeForAPI(tradeType),
          reference: transactionReference,
          portfolioShortName: portfolio.shortName,
        },
      });

      handleBadAPIResponse(apiResponse);

      await saveToLocalTradeOrders({
        ...newTradeOrder,
        reference: transactionReference,
      });

      setSubmitting(false);
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
    ImportTradeOrderQueryResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data || !apiResponse.data.importTradeOrder?.[0]) {
    throw new Error("Empty response");
  }

  if (apiResponse.data.importTradeOrder[0].importStatus === errorStatus) {
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

const getTradeTypeForAPI = (tradeType: TradeType) => {
  switch (tradeType) {
    case "buy": {
      return "B";
    }
    case "sell": {
      return "S";
    }
    case "subscription": {
      return "SUB";
    }
    case "redemption": {
      return "RED";
    }
    default: {
      throw new Error("Impossible API trade type");
    }
  }
};
