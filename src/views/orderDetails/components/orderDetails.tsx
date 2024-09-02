import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetPortfolioBasicFieldsById } from "api/common/useGetPortfolioBasicFieldsById";
import { useDownloadDocument } from "api/documents/useDownloadDocument";
import { TradeOrderDetails } from "api/orders/types";
import { ReactComponent as DocumentDownloadIcon } from "assets/document-download.svg";
import { Button, Card, CountryFlag } from "components";
import { useModal } from "components/Modal/useModal";
import {
  CancelOrderModalInitialData,
  CancelOrderModalContent,
} from "components/TradingModals/CancelOrderModalContent/CancelOrderModalContent";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { PageLayout } from "layouts/PageLayout/PageLayout";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useNavigate } from "react-router";
import {
  isStatusCancellable,
  isPortfolioAllowedToCancelOrder,
  isTransactionTypeCancellable,
} from "services/permissions/cancelOrder";
import { getBackendTranslation } from "utils/backTranslations";
import { dateFromYYYYMMDD } from "utils/date";
import {
  getOrderTypeName,
  getSwitchDetails,
  isOrderPartOfSwitch,
} from "utils/switchOrders";
import { getTransactionColor } from "utils/transactions";
import { InfoCard } from "views/transactionDetails/components/InfoCard";
import { DataRow } from "../../holdingDetails/components/DataRow";
import { ValueInCurrencies } from "./ValueInCurrencies";

interface OrderDetailsProps {
  data: TradeOrderDetails;
}

export const OrderDetails = ({ data: order }: OrderDetailsProps) => {
  const { t, i18n } = useModifiedTranslation();
  const { downloadDocument, downloading } = useDownloadDocument();
  const navigate = useNavigate();
  const { access, linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const contactRepresentativeTags = useGetContactInfo(false, selectedContactId)
    ?.data?.representativeTags;
  const {
    Modal,
    onOpen: onCancelOrderModalOpen,
    modalProps: cancelOrderModalProps,
    contentProps: cancelOrderModalContentProps,
  } = useModal<CancelOrderModalInitialData>();

  const { data: orderParentPortfolio } = useGetPortfolioBasicFieldsById(
    order.parentPortfolio.id
  );

  const isPartOfSwitch = isOrderPartOfSwitch(order);
  const switchDetails = isPartOfSwitch ? getSwitchDetails(order) : undefined;
  const switchFromOrder = switchDetails?.fromOrder as
    | TradeOrderDetails
    | undefined;
  const switchToOrder = switchDetails?.toOrder as TradeOrderDetails | undefined;

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
    isPortfolioAllowedToCancelOrder(
      contactRepresentativeTags,
      orderParentPortfolio,
      linkedContact
    );

  return (
    <PageLayout>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-start-1 md:row-start-1 md:row-end-2 lg:row-end-3">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[repeat(auto-fill,_minmax(175px,_1fr))]">
            <InfoCard
              label={t("transactionsPage.type")}
              value={getOrderTypeName(order, t, i18n.language)}
              severity={getTransactionColor(
                order.type.amountEffect,
                order.type.cashFlowEffect,
                isPartOfSwitch
              )}
            />
            <InfoCard
              label={
                isPartOfSwitch
                  ? "Approx. trade amount"
                  : t("transactionsPage.total")
              }
              value={t(
                "numberWithCurrency",
                order.account
                  ? {
                      value: isPartOfSwitch
                        ? switchFromOrder?.tradeAmountInAccountCurrency
                        : order.tradeAmountInAccountCurrency,
                      currency: isPartOfSwitch
                        ? switchFromOrder?.account?.currency.accountCurrencyCode
                        : order.account.currency.accountCurrencyCode,
                    }
                  : {
                      value: isPartOfSwitch
                        ? switchFromOrder?.tradeAmountInSecurityCurrency
                        : order.tradeAmountInSecurityCurrency,
                      currency: isPartOfSwitch
                        ? switchFromOrder?.securityCurrencyCode
                        : order.securityCurrencyCode,
                    }
              )}
            />
            {isPartOfSwitch ? (
              <>
                <div className="col-span-2">
                  <InfoCard
                    label={t("ordersPage.switchSell")}
                    value={
                      <div>
                        <div>
                          <span>{switchFromOrder?.securityName}</span>
                          {switchFromOrder?.security?.country && (
                            <CountryFlag
                              code={switchFromOrder.security.country.code}
                              className="inline ml-1.5 align-baseline w-[20px] h-[14px]"
                            />
                          )}
                        </div>
                      </div>
                    }
                    onClick={
                      switchFromOrder?.security
                        ? () =>
                            navigate(
                              `../holdings/${switchFromOrder?.security?.id}`
                            )
                        : undefined
                    }
                  />
                </div>
                <div className="col-span-2">
                  <InfoCard
                    label={t("ordersPage.switchBuy")}
                    value={
                      <div>
                        <div>
                          <span>{switchToOrder?.securityName}</span>
                          {switchToOrder?.security?.country && (
                            <CountryFlag
                              code={switchToOrder.security.country.code}
                              className="inline ml-1.5 align-baseline w-[20px] h-[14px]"
                            />
                          )}
                        </div>
                      </div>
                    }
                    onClick={
                      switchToOrder?.security
                        ? () =>
                            navigate(
                              `../holdings/${switchToOrder?.security?.id}`
                            )
                        : undefined
                    }
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <InfoCard
                  label={t(
                    order.security
                      ? "transactionsPage.securityName"
                      : "transactionsPage.accountName"
                  )}
                  value={
                    <div>
                      <div>
                        <span>{order?.securityName}</span>
                        {order?.security?.country && (
                          <CountryFlag
                            code={order.security.country.code}
                            className="inline ml-1.5 align-baseline w-[20px] h-[14px]"
                          />
                        )}
                      </div>
                    </div>
                  }
                  onClick={
                    order.security
                      ? () => navigate(`../holdings/${order?.security?.id}`)
                      : undefined
                  }
                />
              </div>
            )}
            <div className="col-span-2">
              <InfoCard
                label={t("transactionsPage.portfolioName")}
                value={orderParentPortfolio?.name}
              />
            </div>
            <InfoCard
              label={t("transactionsPage.transactionDate")}
              value={t("date", {
                date: dateFromYYYYMMDD(order.transactionDate),
              })}
            />
            <InfoCard
              label={t("transactionsPage.settlementDate")}
              value={
                order.settlementDate
                  ? t("date", { date: dateFromYYYYMMDD(order.settlementDate) })
                  : t("messages.notAvailable")
              }
            />
          </div>
        </div>
        {!isPartOfSwitch && ( //show details when normal order
          <div className="md:col-start-2 md:row-start-1 md:row-end-3 lg:row-end-4 gap-4">
            <Card header={t("transactionsPage.details")}>
              <div className="flex flex-col px-2 my-1 divide-y">
                <DataRow
                  label={t("transactionsPage.units")}
                  value={t("number", { value: order.amount })}
                />
                <DataRow
                  label={t("transactionsPage.unitPrice")}
                  value={t("numberWithCurrency", {
                    value: order.unitPriceInSecurityCurrency,
                    currency: order.securityCurrencyCode,
                    formatParams: {
                      value: {
                        // do not round unit price to two decimals - business requirement
                        maximumFractionDigits: 10,
                      },
                    },
                  })}
                />
                <DataRow
                  label={t("transactionsPage.grossTradeAmount")}
                  value={
                    <ValueInCurrencies
                      valueInSecurityCurrency={
                        order.grossPriceInSecurityCurrency
                      }
                      securityCurrencyCode={order.securityCurrencyCode}
                      valueInAccountCurrency={order.grossPriceInAccountCurrency}
                      accountCurrencyCode={
                        order.account?.currency.accountCurrencyCode
                      }
                    />
                  }
                />
                <DataRow
                  label={t("transactionsPage.cost")}
                  value={t("numberWithCurrency", {
                    value: order.costInSecurityCurrency,
                    currency: order.securityCurrencyCode,
                  })}
                />
                <DataRow
                  label={t("transactionsPage.netTradeAmount")}
                  value={
                    <ValueInCurrencies
                      valueInSecurityCurrency={
                        isPartOfSwitch
                          ? switchFromOrder?.tradeAmountInPortfolioCurrency || 0
                          : order.tradeAmountInSecurityCurrency
                      }
                      securityCurrencyCode={order.securityCurrencyCode}
                      valueInAccountCurrency={
                        isPartOfSwitch
                          ? switchFromOrder?.tradeAmountInAccountCurrency || 0
                          : order.tradeAmountInAccountCurrency
                      }
                      accountCurrencyCode={
                        isPartOfSwitch
                          ? switchFromOrder?.account?.currency
                              .accountCurrencyCode
                          : order.account?.currency.accountCurrencyCode
                      }
                    />
                  }
                />
                <DataRow
                  label={t("transactionsPage.fxRate")}
                  value={t("number", {
                    value: isPartOfSwitch
                      ? switchFromOrder?.accountFxRate
                      : order.accountFxRate,
                    formatParams: {
                      value: {
                        minimumFractionDigits: 2,
                      },
                    },
                  })}
                />
                {!!order?.tax && ( //api returns 0 if no tax has been defined
                  <DataRow
                    label={getBackendTranslation(
                      t("transactionsPage.tax"),
                      order?.taxType?.namesAsMap,
                      i18n.language
                    )}
                    value={t("numberWithCurrency", {
                      value: order?.tax,
                      currency: order?.securityCurrencyCode,
                    })}
                  />
                )}

                {!!order?.tax2 && (
                  <DataRow
                    label={getBackendTranslation(
                      t("transactionsPage.tax2"),
                      order?.taxType2?.namesAsMap,
                      i18n.language
                    )}
                    value={t("numberWithCurrency", {
                      value: order?.tax2,
                      currency: order?.securityCurrencyCode,
                    })}
                  />
                )}
                <div />
              </div>
            </Card>
          </div>
        )}

        {isPartOfSwitch ? (
          <div className="flex flex-col gap-y-4">
            <div className="lg:col-start-3 lg:row-start-1 lg:row-end-2">
              <Card header={t("Sell details")}>
                <div className="flex flex-col px-2 my-1 divide-y">
                  <DataRow
                    label={t("transactionsPage.isin")}
                    value={
                      switchFromOrder?.security?.isinCode ??
                      t("messages.notAvailable")
                    }
                  />
                  <DataRow
                    label={t("transactionsPage.marketplace")}
                    value={
                      switchFromOrder?.marketPlace?.name ??
                      switchFromOrder?.security?.exchange?.name ??
                      t("messages.notAvailable")
                    }
                  />
                </div>
              </Card>
            </div>
            <div className="lg:col-start-3 lg:row-start-1 lg:row-end-2">
              <Card header={t("Buy details")}>
                <div className="flex flex-col px-2 my-1 divide-y">
                  <DataRow
                    label={t("transactionsPage.isin")}
                    value={
                      switchToOrder?.security?.isinCode ??
                      t("messages.notAvailable")
                    }
                  />
                  <DataRow
                    label={t("transactionsPage.marketplace")}
                    value={
                      switchToOrder?.marketPlace?.name ??
                      switchToOrder?.security?.exchange?.name ??
                      t("messages.notAvailable")
                    }
                  />
                </div>
              </Card>
            </div>
            {orderCanBeCancelled &&
              portfolioAllowedToCancel &&
              isPartOfSwitch && (
                <div>
                  <Button
                    isFullWidth
                    variant="Red"
                    disabled={!access.cancelOrder}
                    onClick={() =>
                      onCancelOrderModalOpen({
                        order: order,
                        portfolio: orderParentPortfolio,
                      })
                    }
                  >
                    {t("transactionsPage.cancelOrderButtonLabel")}
                  </Button>
                </div>
              )}
          </div>
        ) : (
          <div className="lg:col-start-3 lg:row-start-1 lg:row-end-2">
            <Card header={t("transactionsPage.security")}>
              <div className="flex flex-col px-2 my-1 divide-y">
                <DataRow
                  label={t("transactionsPage.isin")}
                  value={order.security?.isinCode ?? t("messages.notAvailable")}
                />
                <DataRow
                  label={t("transactionsPage.marketplace")}
                  value={
                    order.marketPlace?.name ??
                    order.security?.exchange?.name ??
                    t("messages.notAvailable")
                  }
                />
              </div>
            </Card>
          </div>
        )}
        {/* on lg screens below row ends at 5th grid line (other lines ends at 4)
        to make up the height difference resulting from gap added we set mb-4 */}
        {order.extInfo && (
          <div className="lg:col-start-3 lg:row-start-2 lg:row-end-5 lg:mb-4">
            <Card header={t("transactionsPage.description")}>
              <p className="p-2 text-base font-normal">{order.extInfo}</p>
            </Card>
          </div>
        )}
        {order.documents.length > 0 && (
          <div className="md:col-start-1 md:row-start-2 lg:row-start-3">
            <Button
              isFullWidth
              isLoading={downloading}
              LeftIcon={DocumentDownloadIcon}
              onClick={() => downloadDocument(order.documents[0].identifier)}
            >
              {t("ordersPage.downloadFileButtonLabel")}
            </Button>
          </div>
        )}
        {orderCanBeCancelled && portfolioAllowedToCancel && !isPartOfSwitch && (
          <div>
            <Button
              isFullWidth
              variant="Red"
              disabled={!access.cancelOrder}
              onClick={() =>
                onCancelOrderModalOpen({
                  order: order,
                  portfolio: orderParentPortfolio,
                })
              }
            >
              {t("transactionsPage.cancelOrderButtonLabel")}
            </Button>
          </div>
        )}
      </div>
      <Modal {...cancelOrderModalProps} header={"Cancelling order"}>
        <CancelOrderModalContent {...cancelOrderModalContentProps} />
      </Modal>
    </PageLayout>
  );
};
