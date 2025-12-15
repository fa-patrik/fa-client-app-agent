import { useGetTradeOrderDetails } from "api/orders/useGetTradeOrderDetails";
import { QueryLoadingWrapper } from "components";
import { OrderDetails } from "./components/orderDetails";

interface OrderDetailsViewProps {
  id: string | undefined;
}

// handles view for transaction details and order details
export const OrderDetailsView = ({ id }: OrderDetailsViewProps) => {
  const queryData = useGetTradeOrderDetails(id);
  return <QueryLoadingWrapper {...queryData} SuccessComponent={OrderDetails} />;
};
