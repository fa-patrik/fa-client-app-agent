import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import classNames from "classnames";
import { Badge, Card } from "components";
import { isLocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate, useParams } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import {
  isStatusCancellable,
  isTransactionTypeCancellable,
} from "services/permissions/cancelOrder";
import { PermissionMode, useFeature } from "services/permissions/usePermission";
import { getBackendTranslation } from "utils/backTranslations";
import { dateFromYYYYMMDD } from "utils/date";
import {
  getOrderTypeName,
  getSwitchDetails,
  isOrderPartOfSwitch,
} from "utils/switchOrders";
import { getTransactionColor } from "utils/transactions";
import type { OrderProps, OrdersListProps } from "./OrdersGroup";

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

  const { canPf: canPfCancelOrder } = useFeature(
    PortfolioGroups.CANCEL_ORDER,
    RepresentativeTag.CANCEL_ORDER,
    PermissionMode.SELECTED
  );

  const portfolioAllowedToCancel =
    orderParentPortfolio && canPfCancelOrder(orderParentPortfolio);

  const TypeBadge = () => {
    return (
      <Badge
        severity={getTransactionColor(
          order.type.amountEffect,
          order.type.cashFlowEffect,
          isPartOfSwitch
        )}
      >
        {getOrderTypeName(order, t, i18n.language, i18n.resolvedLanguage)}
      </Badge>
    );
  };

  return (
    <tr
      onClick={!isLocalOrder(order) ? onClick : undefined}
      className={classNames(
        "h-12 hover:bg-primary-50 border-t transition-colors",
        {
          "cursor-pointer": !isLocalOrder(order),
        }
      )}
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
                  <span>
                    {getBackendTranslation(
                      switchDetails?.fromOrder?.securityName,
                      switchDetails?.fromOrder?.security?.namesAsMap,
                      i18n.language,
                      i18n.resolvedLanguage
                    )}
                  </span>
                  <span>
                    {getBackendTranslation(
                      switchDetails?.toOrder?.securityName,
                      switchDetails?.toOrder?.security?.namesAsMap,
                      i18n.language,
                      i18n.resolvedLanguage
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <span>
              {getBackendTranslation(
                order.securityName,
                order.security?.namesAsMap,
                i18n.language,
                i18n.resolvedLanguage
              )}
            </span>
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
              className="w-6 h-6 text-primary-600 transition-transform hover:scale-110 cursor-pointer stroke-primary-600"
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
  );
};
