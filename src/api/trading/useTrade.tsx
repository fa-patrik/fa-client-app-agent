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
  mutation ImportTradeOrder(
    $portfolioShortName: String
    $transactionDate: String
    $securityCode: String
    $transactionTypeCode: String
    $units: String
    $tradeAmount: String
    $reference: String
    $executionMethod: String
    $unitPrice: String
    $accountFxRate: String
    $reportFxRate: String
    $tags: String
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
        account: "AUTO"
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

interface ImportTradeOrderQueryVariables {
  portfolioShortName: string;
  transactionDate: Date;
  securityCode: string;
  transactionTypeCode: string;
  reference: string;
  units?: number;
  tradeAmount?: number;
  executionMethod: ExecutionMethod;
  fxRate?: number | string;
  reportFxRate?: number | string;
  accountFxRate?: number | string;
  unitPrice?: number | string;
  tags?: string;
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
  const { t } = useModifiedTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [handleAPITrade] = useMutation<
    ImportTradeOrderQueryResponse,
    ImportTradeOrderQueryVariables
  >(IMPORT_TRADE_ORDER_MUTATION);

  const saveToLocalTradeOrders = useLocalTradeStorageMutation();
  const getUniqueReference = useUniqueReference();
  const { access } = useKeycloak();

  const handleTrade = async () => {
    setSubmitting(true);
    try {
      const {
        tradeType,
        portfolio,
        reportFxRate,
        accountFxRate,
        fxRate,
        unitPrice,
      } = newTradeOrder;
      if (!portfolio) {
        return;
      }
      const transactionReference = getUniqueReference();

      const apiResponse = await handleAPITrade({
        variables: {
          ...newTradeOrder,
          reportFxRate,
          accountFxRate,
          fxRate,
          unitPrice: unitPrice !== undefined ? unitPrice : "AUTO",
          transactionDate: new Date(),
          transactionTypeCode: getTradeTypeForAPI(tradeType),
          reference: transactionReference,
          portfolioShortName: portfolio.shortName,
          tags: access.advisor ? ADVISOR_TAG : undefined,
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
