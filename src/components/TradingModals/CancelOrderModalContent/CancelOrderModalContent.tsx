import { useState, MutableRefObject } from "react";
import { Portfolio } from "api/initial/useGetContactInfo";
import { TradeOrder } from "api/orders/types";
import { useCancelOrder } from "api/orders/useCancelOrder";
import { Badge } from "components";
import { Button, LabeledDiv } from "components/index";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { getSwitchDetails, isOrderPartOfSwitch } from "utils/switchOrders";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";

export interface CancelOrderModalInitialData {
  order: TradeOrder;
  portfolio: Portfolio;
}

interface CancelOrderModalProps extends CancelOrderModalInitialData {
  onClose: () => void;
  modalInitialFocusRef: MutableRefObject<null>;
}

export const CancelOrderModalContent = ({
  onClose,
  portfolio,
  order,
  modalInitialFocusRef,
}: CancelOrderModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const { t, i18n } = useModifiedTranslation();

  const isPartOfSwitch = isOrderPartOfSwitch(order);

  const switchDetails = isPartOfSwitch ? getSwitchDetails(order) : undefined;

  const typeTranslated = getNameFromBackendTranslations(
    isPartOfSwitch
      ? t("cancelOrderModal.switchTypeName")
      : order.type.typeName ?? "",
    i18n.language,
    order.type.typeNamesAsMap
  );

  const typeColor = isPartOfSwitch
    ? "green"
    : getTransactionColor(
        order.type.amountEffect ?? 0,
        order.type.cashFlowEffect ?? 0
      );

  const TypeBadge = () => {
    return <Badge colorScheme={typeColor}>{typeTranslated}</Badge>;
  };

  const { readonly } = useKeycloak();

  //the order
  const { handleOrderCancel: cancelOrder1 } = useCancelOrder({
    orderId: order.id,
    reference: order.reference,
    portfolioId: order.parentPortfolio.id,
  });

  //the order's linked order
  //in case of a switch
  const { handleOrderCancel: cancelOrder2 } = useCancelOrder({
    orderId: order.linkedTransaction?.id,
    reference: order.linkedTransaction?.reference,
    portfolioId: order.linkedTransaction?.parentPortfolio.id,
  });

  return (
    <div className="flex flex-col gap-y-2 justify-center max-w-md">
      <div className="w-full text-left text-gray-600 text-md">
        {t("cancelOrderModal.question")}
      </div>

      <hr className="my-1" />

      <div className="flex flex-row flex-wrap gap-y-3">
        <LabeledDiv
          label={t("cancelOrderModal.type")}
          className="flex flex-col gap-1 items-start w-1/2 font-semibold text-gray-700 text-md"
        >
          <TypeBadge />
        </LabeledDiv>
        <LabeledDiv
          label={t("cancelOrderModal.portfolio")}
          className="w-1/2 font-semibold text-gray-700 text-md"
        >
          {portfolio.name}
        </LabeledDiv>

        {isPartOfSwitch ? (
          <>
            <LabeledDiv
              label={t("cancelOrderModal.switchSell")}
              className="w-1/2 font-semibold text-gray-700 text-md"
            >
              {switchDetails?.fromOrder?.securityName}
            </LabeledDiv>
            <LabeledDiv
              label={t("cancelOrderModal.switchBuy")}
              className="w-1/2 font-semibold text-gray-700 text-md"
            >
              {switchDetails?.toOrder?.securityName}
            </LabeledDiv>
          </>
        ) : (
          <>
            <LabeledDiv
              label={t("cancelOrderModal.security")}
              className="w-1/2 font-semibold text-gray-700 text-md"
            >
              {order.securityName}
            </LabeledDiv>

            <LabeledDiv
              label={t("cancelOrderModal.date")}
              className="w-1/2 font-semibold text-gray-700 text-md"
            >
              {order.transactionDate}
            </LabeledDiv>
          </>
        )}
      </div>

      <hr className="my-1" />

      <div className="flex flex-row gap-4" ref={modalInitialFocusRef}>
        <Button
          isFullWidth
          disabled={submitting}
          onClick={onClose}
          variant="Red"
        >
          {t("cancelOrderModal.backButtonLabel")}
        </Button>

        <Button
          disabled={readonly || submitting}
          isLoading={submitting}
          isFullWidth
          onClick={async () => {
            setSubmitting(true);
            await cancelOrder1();
            if (isPartOfSwitch) {
              //passing false to disable a second toast notification
              await cancelOrder2(false); //in case of a switch order
            }
            onClose();
          }}
        >
          {t("cancelOrderModal.confirmButtonLabel")}
        </Button>
      </div>

      <div className="w-full text-xs text-center text-gray-600">
        {t("cancelOrderModal.cancelDisclaimer")}
      </div>
    </div>
  );
};
