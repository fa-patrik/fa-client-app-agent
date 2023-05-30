import { useGetPortfolioTradeOrders } from "api/orders/useGetPortfolioTradeOrders";
import { useLocalTradeStorageState } from "hooks/useLocalTradeStorageState";
import { useParams } from "react-router-dom";
import { Orders } from "views/orders/orders";

export const OrdersPage = () => {
  const { portfolioId } = useParams();
  const portfolioIdAsNr = portfolioId ? parseInt(portfolioId, 10) : undefined;
  const queryData = useGetPortfolioTradeOrders(portfolioIdAsNr);
  const { data, startDate, endDate } = queryData;
  const { orders: unhandledOrdersFromLocalStorage } = useLocalTradeStorageState(
    portfolioIdAsNr,
    startDate,
    endDate
  );
  const localAndAPIOrders = data && [
    ...data,
    ...unhandledOrdersFromLocalStorage,
  ];

  return <Orders {...queryData} data={localAndAPIOrders} />;
};
