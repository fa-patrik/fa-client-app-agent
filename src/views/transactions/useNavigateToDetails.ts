import { LocalTradeOrderId } from "hooks/useLocalTradeStorageState";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router-dom";
import type { TransactionType } from "views/transactionDetails/transactionDetailsView";

export const getNavigationPath = (type: TransactionType) => {
  return type === "transaction" ? "../transactions" : "../orders";
};

export const useNavigateToDetails = (type: TransactionType) => {
  const navigate = useNavigate();
  const { t } = useModifiedTranslation();
  return (transactionId: number) => {
    if (transactionId === LocalTradeOrderId) {
      return undefined;
    }
    return () =>
      navigate(`${getNavigationPath(type)}/${transactionId}`, {
        state: {
          header:
            type === "transaction"
              ? t("transactionsPage.header")
              : t("ordersPage.header"),
        },
      });
  };
};
