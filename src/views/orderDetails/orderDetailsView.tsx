import { useGetTradeOrderDetails } from "api/orders/useGetTradeOrderDetails";
import { DetailsHeading, QueryLoadingWrapper } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router-dom";
import { OrderDetails } from "./components/orderDetails";

interface OrderDetailsViewProps {
  id: string | undefined;
}

// handles view for transaction details and order details
export const OrderDetailsView = ({ id }: OrderDetailsViewProps) => {
  const { t } = useModifiedTranslation();
  const queryData = useGetTradeOrderDetails(id);
  const navigate = useNavigate();
  return (
    <div className="flex overflow-hidden flex-col h-full">
      <DetailsHeading onBackButtonClick={() => navigate(-1)}>
        {t("ordersPage.header")}
      </DetailsHeading>
      <div className="overflow-y-auto h-full grow-1">
        <QueryLoadingWrapper {...queryData} SuccessComponent={OrderDetails} />
      </div>
    </div>
  );
};
