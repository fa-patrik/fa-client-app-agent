import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import { Badge, Grid } from "components";
import { isLocalOrder } from "hooks/useLocalTradeStorageState";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate, useParams } from "react-router-dom";
import { dateFromYYYYMMDD } from "utils/date";
import { getSwitchDetails, isOrderPartOfSwitch } from "utils/switchOrders";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";
import { OrderProps, OrdersListProps } from "./OrdersGroup";

export const OrdersListWithTwoLinesRow = ({ orders }: OrdersListProps) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 items-center">
      {orders.map((order) => (
        <Order
          order={order}
          key={isLocalOrder(order) ? order.reference : order.id}
          onClick={() => navigate(`/..holdings/${order.id}`)}
        />
      ))}
    </div>
  );
};

const Order = ({ order, onClick }: OrderProps) => {
  const { t, i18n } = useModifiedTranslation();
  const { portfolioId } = useParams();
  const showPortfolioLabel = !portfolioId;

  const { data: orderParentPortfolio } = useGetPortfolioBasicFieldsById(
    order.parentPortfolio.id
  );

  const isPartOfSwitch = isOrderPartOfSwitch(order);
  const switchDetails = isPartOfSwitch ? getSwitchDetails(order) : undefined;

  return (
    <>
      <Grid.Row className="py-2 border-b" onClick={onClick}>
        <div className="col-span-2">
          <div className="flex gap-4 justify-between items-center text-left text-gray-800">
            {isPartOfSwitch ? (
              <div className="flex flex-row gap-x-1 text-sm">
                <div className="flex flex-col gap-y-1 font-normal text-gray-500">
                  <span>Sell:</span>
                  <span>Buy:</span>
                </div>
                <div className="flex flex-col gap-y-1 font-semibold text-black ">
                  <span className="truncate">
                    {switchDetails?.fromOrder?.securityName}
                  </span>
                  <span className="truncate">
                    {switchDetails?.toOrder?.securityName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-base font-semibold">
                {order.securityName}
              </div>
            )}

            <div className="text-base font-medium">
              {t("numberWithCurrency", {
                value: order.tradeAmountInPortfolioCurrency,
                currency: orderParentPortfolio?.currency.securityCode,
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm md:text-base font-semibold text-gray-500">
              <span>
                {t("date", { date: dateFromYYYYMMDD(order.transactionDate) })}
              </span>
              {showPortfolioLabel && (
                <span>{` - ${orderParentPortfolio?.name}`}</span>
              )}
            </div>
            <div className="float-right w-max text-center">
              <Badge
                colorScheme={getTransactionColor(
                  order.type.amountEffect,
                  order.type.cashFlowEffect,
                  isPartOfSwitch
                )}
              >
                {isPartOfSwitch
                  ? "Switch"
                  : getNameFromBackendTranslations(
                      order.type.typeName,
                      i18n.language,
                      order.type.typeNamesAsMap
                    )}
              </Badge>
            </div>
          </div>
          <div className="ml-auto">
            {t(`ordersPage.orderStatuses.${order.orderStatus}`)}
          </div>
        </div>
      </Grid.Row>
    </>
  );
};
