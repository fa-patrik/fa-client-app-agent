import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useDetailsHeader } from "layouts/DetailsLayout/DetailsHeaderContext";
import { useParams } from "react-router-dom";
import { OrderDetailsView } from "views/orderDetails/orderDetailsView";

export const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { t } = useModifiedTranslation();
  useDetailsHeader(t("ordersPage.header").toString());
  return <OrderDetailsView id={orderId} />;
};
