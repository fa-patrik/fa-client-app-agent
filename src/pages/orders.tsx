import { useGetAllTradeOrders } from "api/orders/useGetAllTradeOrders";
import { useLocalTradeStorageState } from "hooks/useLocalTradeStorageState";
import { Orders } from "views/orders/orders";

export const OrdersPage = () => {
  const queryData = useGetAllTradeOrders();
  const { data, startDate, endDate } = queryData;
  const { orders: unhandledOrdersFromLocalStorage } = useLocalTradeStorageState(
    undefined,
    startDate,
    endDate
  );

  const localAndAPIOrders = data && [
    ...data,
    ...unhandledOrdersFromLocalStorage,
  ];

  return <Orders {...queryData} data={localAndAPIOrders} />;
};
