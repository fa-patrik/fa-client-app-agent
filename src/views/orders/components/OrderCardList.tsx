import { useRef } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import {
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import { ReactComponent as ChevronDown } from "assets/chevron-down.svg";
import { ReactComponent as ChevronUp } from "assets/chevron-up.svg";
import classNames from "classnames";
import { Badge, Button } from "components";
import { isLocalOrder } from "hooks/useLocalTradeStorageState";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { OrderProps, OrdersListProps } from "./OrdersGroup";

export const OrderCardList = ({
  orders,
  onCancelOrderModalOpen,
}: OrdersListProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-y-4 items-center">
      {orders.map((order) => (
        <OrderCard
          order={order}
          onCancelOrderModalOpen={onCancelOrderModalOpen}
          key={isLocalOrder(order) ? order.reference : order.id}
          onClick={() => navigate(`/..holdings/${order.id}`)}
        />
      ))}
    </div>
  );
};

const OrderCard = ({ order, onCancelOrderModalOpen }: OrderProps) => {
  const { t, i18n } = useModifiedTranslation();
  const { data: orderParentPortfolio } = useGetPortfolioBasicFieldsById(
    order.parentPortfolio.id
  );
  const { portfolioId } = useParams();

  const isPartOfSwitch = isOrderPartOfSwitch(order);

  const switchDetails = isPartOfSwitch ? getSwitchDetails(order) : undefined;

  const disclosureButtonRef = useRef<HTMLButtonElement>(null);
  const toggleDisclosure = () => {
    disclosureButtonRef.current?.click();
  };

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

  const canExpandCard =
    !isLocalOrder(order) || (orderCanBeCancelled && portfolioAllowedToCancel);

  return (
    <div
      onClick={toggleDisclosure}
      className={classNames("w-full rounded-lg border shadow-md", {
        "cursor-pointer": canExpandCard,
      })}
    >
      {/** Card top notch*/}
      <div className="flex flex-row gap-x-1 justify-between p-2 w-full bg-gray-100 rounded-t-md border-b">
        <div className="w-fit">
          <Badge
            severity={getTransactionColor(
              order.type.amountEffect,
              order.type.cashFlowEffect,
              isPartOfSwitch
            )}
          >
            {getOrderTypeName(order, t, i18n.language)}
          </Badge>
        </div>

        <div className="text-sm font-semibold">
          {isPartOfSwitch
            ? getBackendTranslation(
                switchDetails?.fromOrder?.securityName,
                switchDetails?.fromOrder?.security?.namesAsMap,
                i18n.language
              )
            : getBackendTranslation(
                order.securityName,
                order?.security?.namesAsMap,
                i18n.language
              )}
        </div>
      </div>
      {/** Card content  */}
      <div className="p-2">
        <ul className="flex flex-col gap-y-1">
          {isPartOfSwitch && (
            <li className="flex flex-row justify-between">
              <div className="w-1/2 text-sm">{t("ordersPage.switchBuy")}</div>
              <div className="text-sm text-right">
                {getBackendTranslation(
                  switchDetails?.toOrder?.securityName,
                  switchDetails?.toOrder?.security?.namesAsMap,
                  i18n.language
                )}
              </div>
            </li>
          )}
          {!portfolioId && (
            <li className="flex flex-row justify-between">
              <div className="w-1/2 text-sm">{t("ordersPage.portfolio")}</div>
              <div className="text-sm text-right">
                {orderParentPortfolio?.name}
              </div>
            </li>
          )}
          {!isPartOfSwitch && (
            <li className="flex flex-row justify-between">
              <div className="w-1/2 text-sm">{t("ordersPage.units")}</div>
              <div className="text-sm text-right">
                {order.amount !== undefined
                  ? t("number", {
                      value: order.amount,
                    })
                  : "-"}
              </div>
            </li>
          )}
          <li className="flex flex-row justify-between">
            <div className="w-1/2 text-sm">
              {isPartOfSwitch
                ? t("ordersPage.approximateTradeAmount")
                : t("ordersPage.tradeAmount")}
            </div>
            <div className="text-sm text-right">
              {(isPartOfSwitch &&
                switchDetails?.fromOrder?.tradeAmountInPortfolioCurrency !==
                  undefined) ||
              order.tradeAmountInPortfolioCurrency !== undefined
                ? t("numberWithCurrency", {
                    value: isPartOfSwitch
                      ? switchDetails?.fromOrder?.tradeAmountInPortfolioCurrency
                      : order.tradeAmountInPortfolioCurrency,
                    currency: orderParentPortfolio?.currency.securityCode,
                  })
                : "-"}
            </div>
          </li>
          <li className="flex flex-row justify-between">
            <div className="w-1/2 text-sm">
              {t("ordersPage.transactionDate")}
            </div>
            <div className="text-sm text-right">
              {t("date", { date: dateFromYYYYMMDD(order.transactionDate) })}
            </div>
          </li>
          <li className="flex flex-row justify-between">
            <div className="w-1/2 text-sm">{t("ordersPage.status")}</div>
            <div className="text-sm text-right">
              {t(
                `ordersPage.orderStatuses.${
                  isPartOfSwitch
                    ? switchDetails?.switchOrderStatus
                    : order.orderStatus
                }`
              )}
            </div>
          </li>
        </ul>
      </div>
      {/** Card bottom notch  */}
      <div className="py-1 px-2 w-full bg-gray-100 rounded-b-md border-t">
        {canExpandCard && (
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button
                  onClick={toggleDisclosure}
                  className="flex flex-row justify-end py-1 w-full"
                  ref={disclosureButtonRef}
                >
                  {open && (
                    <ChevronDown className="ml-auto text-gray-500 w-[16px] h-[16px]" />
                  )}
                  {!open && (
                    <ChevronUp className="ml-auto text-gray-500 w-[16px] h-[16px]" />
                  )}
                </Disclosure.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel className="flex flex-row gap-y-2 justify-between items-end py-1 w-full text-gray-500">
                    {!isLocalOrder(order) && (
                      <div>
                        <Button size="xs" variant="Outlined">
                          <Link
                            onClick={(e) => e.stopPropagation()}
                            id={`linkToOrderDetails-${order.id}`}
                            //target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs"
                            to={`../orders/${order.id}`}
                          >
                            {t("ordersPage.details")}
                          </Link>
                        </Button>
                      </div>
                    )}

                    {orderCanBeCancelled && portfolioAllowedToCancel && (
                      <div className="flex flex-row gap-x-2">
                        <button
                          id={`cancelOrder-${order.id}`}
                          onClick={(event: React.MouseEvent) => {
                            event.stopPropagation(); //hinders the parent onClick
                            if (onCancelOrderModalOpen) {
                              onCancelOrderModalOpen({
                                portfolio: orderParentPortfolio,
                                order: order,
                              });
                            }
                          }}
                          className="flex flex-row gap-x-1 items-center py-0.5 px-2 text-xs text-red-600 rounded-full border border-red-500 shadow-sm w-fit h-fit"
                          data-tooltip-content={t("ordersPage.cancelOrder")}
                          data-tooltip-id="cancelOrderTooltip"
                        >
                          {t("ordersPage.cancelButtonLabel")}
                          <CancelIcon className="p-0 m-0 w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        )}
      </div>
    </div>
  );
};
