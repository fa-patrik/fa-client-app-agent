import { useGetTransactionDetails } from "api/transactions/useGetTransactionDetails";
import { DetailsHeading, QueryLoadingWrapper } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router-dom";
import { TransactionDetails } from "./components/transactionDetails";

export type TransactionType = "transaction" | "order";

interface TransactionDetailsViewProps {
  id: string | undefined;
  type: TransactionType;
}

// handles view for transaction details and order details
export const TransactionDetailsView = ({
  id,
  type,
}: TransactionDetailsViewProps) => {
  const queryData = useGetTransactionDetails(id);
  const navigate = useNavigate();
  return (
    <div className="flex overflow-hidden flex-col h-full">
      <DetailsHeading onBackButtonClick={() => navigate(-1)}>
        <HeaderLabel type={type} />
      </DetailsHeading>
      <div className="overflow-y-auto h-full grow-1">
        <QueryLoadingWrapper
          {...queryData}
          SuccessComponent={TransactionDetails}
        />
      </div>
    </div>
  );
};

export const getNavigationPath = (type: TransactionType) => {
  return type === "transaction" ? "../transactions" : "../orders";
};

interface HeaderLabelProps {
  type: TransactionType;
}

const HeaderLabel = ({ type }: HeaderLabelProps) => {
  const { t } = useModifiedTranslation();
  return (
    <>
      {type === "transaction"
        ? t("transactionsPage.header")
        : t("ordersPage.header")}
    </>
  );
};
