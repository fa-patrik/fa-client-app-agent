import { useParams } from "react-router-dom";
import { OrderDetailsView } from "views/orderDetails/orderDetailsView";

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  return <OrderDetailsView id={orderId} />;
};
