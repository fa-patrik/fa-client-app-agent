import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import { Badge, Card } from "components";
import { isLocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import {
  isStatusCancellable,
  isPortfolioAllowedToCancelOrder,
  isTransactionTypeCancellable,
} from "services/permissions/cancelOrder";
import { dateFromYYYYMMDD } from "utils/date";
import { getSwitchDetails, isOrderPartOfSwitch } from "utils/switchOrders";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";
import { OrderProps, OrdersListProps } from "./OrdersGroup";

export const OrdersListWithOneLineRow = ({
  orders,
  isAnyOrderCancellable,
  onCancelOrderModalOpen,
}: OrdersListProps) => {
  const { portfolioId } = useParams();
  const showPortfolioLabel = !portfolioId;
  const { t } = useModifiedTranslation();

  const isLgVersion = useMatchesBreakpoint("lg");
  const navigate = useNavigate();

  return (
    <Card>
      <Tooltip id="cancelOrderTooltip" place="top" />
      <table className="w-full table-auto">
        <thead className="text-sm font-semibold text-gray-500 bg-gray-100">
          <tr>
            <th className="p-1 text-center ">{t("ordersPage.type")}</th>
            <th colSpan={2} className="py-1 px-2 text-left ">
              {t("ordersPage.security")}
            </th>
            {showPortfolioLabel && (
              <th className="p-1 text-left">{t("ordersPage.portfolioName")}</th>
            )}
            <th className="py-1 px-2 text-right ">
              {t("ordersPage.tradeAmount")}
            </th>
            {isLgVersion && (
              <>
                <th className="p-1 text-right ">{t("ordersPage.units")}</th>
                <th className="p-1 text-right ">
                  {t("ordersPage.transactionDate")}
                </th>
              </>
            )}
            <th className="py-1 text-center">{t("ordersPage.status")}</th>
            {isAnyOrderCancellable && <th></th>}
          </tr>
        </thead>
        <tbody className="text-sm">
          {orders.map((order) => (
            <Order
              order={order}
              {...order}
              key={isLocalOrder(order) ? order.reference : order.id}
              showPortfolioLabel={showPortfolioLabel}
              onClick={() => navigate(`../orders/${order.id}`)}
              isAnyOrderCancellable={isAnyOrderCancellable}
              onCancelOrderModalOpen={onCancelOrderModalOpen}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
};

const Order = ({
  order,
  onClick,
  showPortfolioLabel,
  isAnyOrderCancellable,
  onCancelOrderModalOpen,
}: OrderProps) => {
  const isLgVersion = useMatchesBreakpoint("lg");
  const { t, i18n } = useModifiedTranslation();

  const { data: orderParentPortfolio } = useGetPortfolioBasicFieldsById(
    order.parentPortfolio.id
  );

  const isPartOfSwitch = isOrderPartOfSwitch(order);
  const switchDetails = isPartOfSwitch ? getSwitchDetails(order) : undefined;

  const orderCanBeCancelled =
    isStatusCancellable(
      isPartOfSwitch && switchDetails?.fromOrder?.orderStatus
        ? switchDetails?.fromOrder?.orderStatus
        : order.orderStatus
    ) &&
    isTransactionTypeCancellable(
      isPartOfSwitch && switchDetails?.fromOrder?.type.typeCode
        ? switchDetails?.fromOrder?.type.typeCode
        : order.type.typeCode
    );

  const portfolioAllowedToCancel =
    orderParentPortfolio &&
    isPortfolioAllowedToCancelOrder(orderParentPortfolio);

  const TypeBadge = () => {
    return (
      <Badge
        colorScheme={getTransactionColor(
          order.type.amountEffect,
          order.type.cashFlowEffect,
          isPartOfSwitch
        )}
      >
        {isPartOfSwitch
          ? t("ordersPage.switch")
          : getNameFromBackendTranslations(
              order.type.typeName,
              i18n.language,
              order.type.typeNamesAsMap
            )}
      </Badge>
    );
  };

  return (
    <>
      <tr
        onClick={onClick}
        className="h-12 hover:bg-primary-50 border-t transition-colors cursor-pointer"
      >
        <td className="px-1">
          <div className="flex justify-center">
            <TypeBadge />
          </div>
        </td>
        <td className="px-2 font-semibold text-left" colSpan={2}>
          <div>
            {isPartOfSwitch ? (
              <>
                <div className="flex flex-row gap-x-1">
                  <div className="flex flex-col gap-y-1 font-normal text-gray-500">
                    <span>{t("ordersPage.switchSell")}</span>
                    <span>{t("ordersPage.switchBuy")}</span>
                  </div>
                  <div className="flex flex-col gap-y-1 font-semibold text-black">
                    <span>{switchDetails?.fromOrder?.securityName}</span>
                    <span>{switchDetails?.toOrder?.securityName}</span>
                  </div>
                </div>
              </>
            ) : (
              <span>{order.securityName}</span>
            )}
          </div>
        </td>
        {showPortfolioLabel && (
          <td className="px-1 text-left text-gray-500">
            {orderParentPortfolio?.name}
          </td>
        )}
        <td className="px-2 font-medium text-right">
          {order.tradeAmountInPortfolioCurrency !== undefined
            ? t("numberWithCurrency", {
                value: order.tradeAmountInPortfolioCurrency,
                currency: orderParentPortfolio?.currency.securityCode,
              })
            : "-"}
        </td>
        {isLgVersion && (
          <>
            <td className="px-1 font-medium text-right">
              {order.amount != null && !isPartOfSwitch
                ? t("number", { value: order.amount })
                : "-"}
            </td>
            <td className="px-1 font-medium text-right text-gray-500">
              <span>
                {t("date", { date: dateFromYYYYMMDD(order.transactionDate) })}
              </span>
            </td>
          </>
        )}
        <td className="px-1 font-medium text-center">
          {t(
            `ordersPage.orderStatuses.${
              switchDetails?.switchOrderStatus ?? order.orderStatus
            }`
          )}
        </td>
        {orderCanBeCancelled && portfolioAllowedToCancel ? (
          <td className="pr-4 h-full">
            <div
              id={`cancelOrder-${order.id}`}
              className="ml-auto w-fit"
              data-tooltip-content={t("ordersPage.cancelOrder")}
              data-tooltip-id="cancelOrderTooltip"
            >
              <CancelIcon
                className="w-6 h-6 text-primary-600 transition-transform hover:scale-110 hover:cursor-pointer stroke-primary-600"
                onClick={(event: React.MouseEvent) => {
                  event.stopPropagation(); //hinders the parent onClick
                  if (onCancelOrderModalOpen) {
                    onCancelOrderModalOpen({
                      portfolio: orderParentPortfolio,
                      order: order,
                    });
                  }
                }}
              />
            </div>
          </td>
        ) : (
          isAnyOrderCancellable && <td></td>
        )}
      </tr>
    </>
  );
};
