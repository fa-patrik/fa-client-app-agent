import { useState } from "react";
import { FetchResult, gql, useMutation } from "@apollo/client";
import { ADVISOR_TAG } from "api/constants";
import { ExecutionMethod } from "api/enums";
import { TransactionType } from "api/transactions/enums";
import {
  LocalTradeOrderDetails,
  useLocalTradeStorageMutation,
} from "hooks/useLocalTradeStorageMutation";
import { useKeycloak } from "providers/KeycloakProvider";
import { toast } from "react-toastify";
import { useModifiedTranslation } from "../../hooks/useModifiedTranslation";
import { useUniqueReference } from "../../hooks/useUniqueReference";

const IMPORT_TRADE_ORDER_MUTATION = gql`
  mutation importLimitedTradeOrder(
    $portfolioShortName: String
    $transactionDate: String
    $securityCode: String
    $transactionTypeCode: String
    $units: Float
    $autoUnitPrice: Boolean
    $unitPrice: Float
    $tradeAmount: Float
    $reference: String
    $executionMethod: Int
    $accountFxRate: Float
    $reportFxRate: Float
    $tags: String
    $account: String
  ) {
    importLimitedTradeOrder(
      limitedTradeOrder: {
        parentPortfolio: $portfolioShortName
        transactionDate: $transactionDate
        security: $securityCode
        type: $transactionTypeCode
        status: "4"
        amount: $units
        autoUnitPrice: $autoUnitPrice
        tradeAmount: $tradeAmount
        account: $account
        unitPrice: $unitPrice
        reportFxRate: $reportFxRate
        accountFxRate: $accountFxRate
        reference: $reference
        executionMethod: $executionMethod
        tags: $tags
      }
    )
  }
`;

interface importLimitedTradeOrderQueryVariables {
  portfolioShortName: string;
  transactionDate: Date;
  securityCode: string;
  transactionTypeCode: string;
  reference: string;
  units?: number;
  tradeAmount?: number;
  executionMethod: ExecutionMethod;
  reportFxRate?: number;
  accountFxRate?: number;
  autoUnitPrice?: boolean;
  unitPrice?: number;
  tags?: string;
  account?: string; //account number
}

const errorStatus = "ERROR" as const;

interface importLimitedTradeOrderQueryResponse {
  importLimitedTradeOrder: ({
    importStatus: "OK" | typeof errorStatus;
  } & unknown)[];
}

export type TradeType = "sell" | "buy" | "redemption" | "subscription";

export const useTrade = (
  newTradeOrder: Omit<
    importLimitedTradeOrderQueryVariables,
    | "transactionTypeCode"
    | "transactionDate"
    | "reference"
    | "portfolioShortName"
  > &
    Omit<LocalTradeOrderDetails, "tradeType" | "reference"> & {
      tradeType: TradeType;
    }
) => {
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleAPITrade] = useMutation<
    importLimitedTradeOrderQueryResponse,
    importLimitedTradeOrderQueryVariables
  >(IMPORT_TRADE_ORDER_MUTATION);

  const saveToLocalTradeOrders = useLocalTradeStorageMutation();
  const getUniqueReference = useUniqueReference();
  const { access } = useKeycloak();

  const handleTrade = async () => {
    setSubmitting(true);
    try {
      const { tradeType, portfolio, reportFxRate, accountFxRate, unitPrice } =
        newTradeOrder;
      if (!portfolio) {
        return;
      }
      const transactionReference = getUniqueReference();
      const apiResponse = await handleAPITrade({
        variables: {
          ...newTradeOrder,
          reportFxRate,
          accountFxRate,
          autoUnitPrice: unitPrice === undefined,
          unitPrice,
          transactionDate: new Date(),
          transactionTypeCode: getTradeTypeForAPI(tradeType),
          reference: transactionReference,
          portfolioShortName: portfolio.shortName,
          tags: access.advisor ? ADVISOR_TAG : undefined,
          account: newTradeOrder.account ?? "AUTO",
        },
      });

      handleBadAPIResponse(apiResponse);

      await saveToLocalTradeOrders({
        ...newTradeOrder,
        reference: transactionReference,
      });

      toast.success(t("tradingModal.createTradeSuccess"), { autoClose: 3000 });
      setSubmitting(false);
      return apiResponse;
    } catch (e: unknown) {
      toast.error(t("tradingModal.createTradeError"), {
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
    importLimitedTradeOrderQueryResponse,
    Record<string, unknown>,
    Record<string, unknown>
  >
) => {
  if (!apiResponse.data || !apiResponse.data.importLimitedTradeOrder?.[0]) {
    throw new Error("Empty response");
  }

  if (
    apiResponse.data.importLimitedTradeOrder[0].importStatus === errorStatus
  ) {
    let errorMessage = "Bad request: \n";
    Object.entries(apiResponse.data.importLimitedTradeOrder[0]).forEach(
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
      return TransactionType.BUY;
    }
    case "sell": {
      return TransactionType.SELL;
    }
    case "subscription": {
      return TransactionType.SUBSCRIPTION;
    }
    case "redemption": {
      return TransactionType.REDEMPTION;
    }
    default: {
      throw new Error("Impossible API trade type");
    }
  }
};
