import { TradeOrder } from "api/orders/types";
import { Card } from "components";
import {
  CancelOrderModalInitialData
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { LocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { TransactionType } from "../../transactionDetails/transactionDetailsView";
import { OrdersListWithOneLineRow } from "./OrdersListWithOneLineRow";
import { OrdersListWithTwoLinesRow } from "./OrdersListWithTwoLinesRow";

export interface OrdersListProps {
  orders: (TradeOrder | LocalOrder)[];
  isAnyOrderCancellable: boolean;
  onCancelOrderModalOpen: (initialData: CancelOrderModalInitialData) => void;
}

export type OrderProps = TradeOrder & {
  onClick?: () => void;
  showPortfolioLabel?: boolean;
  isAnyOrderCancellable?: boolean;
  onCancelOrderModalOpen?: (initialData: CancelOrderModalInitialData) => void;
};

interface OrdersGroupProps {
  label: string;
  orders: (TradeOrder | LocalOrder)[];
  type: TransactionType;
  isAnyOrderCancellable: boolean;
  onCancelOrderModalOpen: (initialData: CancelOrderModalInitialData) => void;
}

export const OrdersGroup = ({
  label,
  orders,
  isAnyOrderCancellable,
  onCancelOrderModalOpen
}: OrdersGroupProps) => {
  const hasOneLineRow = useMatchesBreakpoint("md");

  const OrdersList = hasOneLineRow
    ? OrdersListWithOneLineRow
    : OrdersListWithTwoLinesRow;

  return (
    <Card key={label} header={label}>
      <OrdersList
        orders={orders}
        isAnyOrderCancellable={isAnyOrderCancellable}
        onCancelOrderModalOpen={onCancelOrderModalOpen}
      />
    </Card>
  );
};
