import { useGetPortfolioBasicFieldsById } from "api/generic/useGetPortfolioBasicFieldsById";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import { Badge } from "components";
import { isLocalOrder } from "hooks/useLocalTradeStorageState";
import { useMatchesBreakpoint } from "hooks/useMatchesBreakpoint";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useParams } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import {
  isStatusCancellable,
  isPortfolioAllowedToCancelOrder,
  isTransactionTypeCancellable,
} from "services/permissions/cancelOrder";
import { dateFromYYYYMMDD } from "utils/date";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";
import { TransactionType } from "views/transactionDetails/transactionDetailsView";
import { useNavigateToDetails } from "views/transactions/useNavigateToDetails";
import { OrderProps, OrdersListProps } from "./OrdersGroup";

export const OrdersListWithOneLineRow = ({
  orders,
  isAnyOrderCancellable,
  onCancelOrderModalOpen,
}: OrdersListProps) => {
  const { portfolioId } = useParams();
  const showPortfolioLabel = !portfolioId;
  const { t } = useModifiedTranslation();

  const type = "order" as TransactionType;
  const navigate = useNavigateToDetails(type);

  const isLgVersion = useMatchesBreakpoint("lg");

  return (
    <div>
      <Tooltip id="cancelOrderTooltip" place="top" />
      <table className="w-full table-fixed">
        <thead className="text-sm font-semibold text-gray-500 bg-gray-200 border-t">
          <tr>
            <th className="py-1 px-2 text-left">
              {t("transactionsPage.security")}
            </th>
            {showPortfolioLabel && (
              <th className="p-1 text-left">
                {t("transactionsPage.portfolioName")}
              </th>
            )}
            <th className="p-1 text-right">
              {t("transactionsPage.transactionDate")}
            </th>
            {isLgVersion && (
              <th className="p-1 text-right">{t("transactionsPage.units")}</th>
            )}
            <th className="p-1 text-center">{t("transactionsPage.type")}</th>
            <th className="py-1 px-2 text-right">
              {t("transactionsPage.tradeAmount")}
            </th>
            {isAnyOrderCancellable && <th></th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <Order
              {...order}
              key={isLocalOrder(order) ? order.reference : order.id}
              showPortfolioLabel={showPortfolioLabel}
              onClick={navigate(order.id)}
              isAnyOrderCancellable={isAnyOrderCancellable}
              onCancelOrderModalOpen={onCancelOrderModalOpen}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Order = ({
  id,
  orderStatus,
  reference,
  transactionDate,
  amount,
  type,
  tradeAmountInPortfolioCurrency,
  securityName,
  parentPortfolio,
  onClick,
  showPortfolioLabel,
  isAnyOrderCancellable,
  onCancelOrderModalOpen,
}: OrderProps) => {
  const isLgVersion = useMatchesBreakpoint("lg");
  const { t, i18n } = useModifiedTranslation();

  const { data: orderParentPortfolio } = useGetPortfolioBasicFieldsById(
    parentPortfolio.id
  );

  const orderCanBeCancelled =
    isStatusCancellable(orderStatus) &&
    isTransactionTypeCancellable(type.typeCode);
  const portfolioAllowedToCancel =
    orderParentPortfolio &&
    isPortfolioAllowedToCancelOrder(orderParentPortfolio);

  const typeTranslated = getNameFromBackendTranslations(
    type.typeName,
    i18n.language,
    type.typeNamesAsMap
  );

  const TypeBadge = () => {
    return (
      <Badge
        colorScheme={getTransactionColor(
          type.amountEffect,
          type.cashFlowEffect
        )}
      >
        {typeTranslated}
      </Badge>
    );
  };

  return (
    <>
      <tr
        onClick={onClick}
        className="h-12 hover:bg-primary-50 border-t transition-colors cursor-pointer"
      >
        <td className="px-2 font-semibold text-left">{securityName}</td>
        {showPortfolioLabel && (
          <td className="px-1 text-sm md:text-base text-left text-gray-500">
            {orderParentPortfolio?.name}
          </td>
        )}
        <td className="px-1 text-sm md:text-base font-medium text-right text-gray-500">
          <span>{t("date", { date: dateFromYYYYMMDD(transactionDate) })}</span>
        </td>
        {isLgVersion && (
          <td className="px-1 text-base font-medium text-right">
            {amount != null ? t("number", { value: amount }) : "-"}
          </td>
        )}
        <td className="px-1 ">
          <div className="flex justify-center">
            <TypeBadge />
          </div>
        </td>
        <td className="px-2 text-base font-medium text-right">
          {t("numberWithCurrency", {
            value: tradeAmountInPortfolioCurrency,
            currency: orderParentPortfolio?.currency.securityCode,
          })}
        </td>
        {orderCanBeCancelled && portfolioAllowedToCancel ? (
          <td className="pr-4 h-full">
            <div
              id={`cancelOrder-${id}`}
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
                      orderId: id,
                      reference: reference,
                      portfolioName: orderParentPortfolio.name,
                      portfolioId: orderParentPortfolio.id,
                      securityName,
                      transactionDate,
                      type,
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
