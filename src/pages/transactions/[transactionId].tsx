import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useDetailsHeader } from "layouts/DetailsLayout/DetailsHeaderContext";
import { useParams } from "react-router-dom";
import { TransactionDetailsView } from "views/transactionDetails/transactionDetailsView";

export const TransactionDetailsPage = () => {
  const { transactionId } = useParams();
  const { t } = useModifiedTranslation();
  useDetailsHeader(t("transactionsPage.header").toString());

  return <TransactionDetailsView id={transactionId} type="transaction" />;
};
