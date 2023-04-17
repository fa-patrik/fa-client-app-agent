import { useState, MutableRefObject } from "react";
import { TradeOrderType } from "api/orders/types";
import { useCancelOrder } from "api/orders/useCancelOrder";
import { Badge } from "components";
import { Button, LabeledDiv } from "components/index";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  getNameFromBackendTranslations,
  getTransactionColor,
} from "utils/transactions";

export interface CancelOrderModalInitialData {
  orderId: number;
  reference: string;
  portfolioName: string;
  securityName: string;
  transactionDate: string;
  portfolioId: number;
  type: TradeOrderType;
}

interface CancelOrderModalProps extends CancelOrderModalInitialData {
  onClose: () => void;
  modalInitialFocusRef: MutableRefObject<null>;
}

export const CancelOrderModalContent = ({
  onClose,
  orderId,
  reference,
  portfolioName,
  securityName,
  transactionDate,
  type,
  portfolioId,
  modalInitialFocusRef,
}: CancelOrderModalProps) => {
  const [submitting, setSubmitting] = useState(false);

  const { handleOrderCancel } = useCancelOrder({
    orderId,
    reference,
    portfolioId,
  });

  const { t, i18n } = useModifiedTranslation();

  const typeTranslated = getNameFromBackendTranslations(
    type.typeName ?? "",
    i18n.language,
    type.typeNamesAsMap
  );

  const typeColor = getTransactionColor(
    type.amountEffect ?? 0,
    type.cashFlowEffect ?? 0
  );

  const TypeBadge = () => {
    return <Badge colorScheme={typeColor}>{typeTranslated}</Badge>;
  };

  const { readonly } = useKeycloak();

  return (
    <div className="flex flex-col gap-2 justify-center min-w-[min(84vw,_450px)]">
      <div className="w-full text-left text-gray-600 text-md">
        {t("cancelOrderModal.question")}
      </div>

      <hr className="my-1" />

      <div className="flex px-1">
        <LabeledDiv
          label={t("cancelOrderModal.portfolio")}
          className="w-1/2 font-semibold text-gray-700 text-md"
        >
          {portfolioName}
        </LabeledDiv>

        <LabeledDiv
          label={t("cancelOrderModal.security")}
          className="w-1/2 font-semibold text-gray-700 text-md"
        >
          {securityName}
        </LabeledDiv>
      </div>

      <div className="flex px-1">
        <LabeledDiv
          label={t("cancelOrderModal.date")}
          className="w-1/2 font-semibold text-gray-700 text-md"
        >
          {transactionDate}
        </LabeledDiv>

        <LabeledDiv
          label={t("cancelOrderModal.type")}
          className="flex flex-col gap-1 items-start w-1/2 font-semibold text-gray-700 text-md"
        >
          <TypeBadge />
        </LabeledDiv>
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
            await handleOrderCancel();
            onClose();
          }}
        >
          {t("cancelOrderModal.confirmButtonLabel")}
        </Button>
      </div>

      <hr className="my-1" />

      <div className="w-full text-xs text-center text-gray-600">
        {t("cancelOrderModal.cancelDisclaimer")}
      </div>
    </div>
  );
};
