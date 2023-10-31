import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import { Button, Card, Input } from "components";

import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import {
  SetValueFunc,
  handleNumberInputEvent,
  handleNumberPasteEvent,
} from "utils/input";
import SecurityInfoCell from "wizards/monthlyInvestments/StepTwo/components/SecurityInfoCell";

const wrapSetValue = (
  setValue: (input: string, securityId: number, mode: string) => void,
  securityId: number,
  mode: string
): SetValueFunc => {
  return (input: string) => {
    setValue(input, securityId, mode);
  };
};

interface SecurityDistributionCardProps {
  security: TradableSecurity;
  handleRemove: (security: TradableSecurity) => void;
  setInput: (input: string, securityId: number, mode: string) => void;
  percentageInputs: Record<string, string | undefined>;
  amountInputs: Record<string, string | undefined>;
  portfolioCurrencyCode: string | undefined;
  id?: string;
}

const SecurityDistributionCard: React.FC<SecurityDistributionCardProps> = ({
  security,
  handleRemove,
  setInput,
  percentageInputs,
  amountInputs,
  portfolioCurrencyCode,
  id,
}) => {
  const { i18n } = useModifiedTranslation();

  const minTradeAmountInPfCurrency = security.minTradeAmount * security.fxRate;

  const { t } = useModifiedTranslation();

  const amount = amountInputs[security.id] || "";
  const percentage = percentageInputs[security.id] || "";
  return (
    <li>
      <Card>
        <div className="flex flex-col gap-y-2 p-2">
          <div className="flex justify-between items-start">
            <SecurityInfoCell
              id={id ?? undefined}
              securityId={security.id}
              countryCode={security.country?.code}
              name={security.name}
              typeName={
                security.type?.namesAsMap?.[i18n.language] ?? security.type.name
              }
              isinCode={security.isinCode}
            />

            <div className="flex gap-x-4 text-red-500">
              <Button
                id={!id ? undefined : `${id}-removeButton`}
                onClick={() => handleRemove(security)}
                variant="Transparent"
                size="xs"
              >
                <CancelIcon />
              </Button>
            </div>
          </div>
          <hr className="border-1" />
          <div className="flex flex-col gap-y-1 items-end">
            <div className="flex flex-row gap-x-2">
              <Input
                id={!id ? undefined : `${id}-percentageInput`}
                label={t(
                  "wizards.monthlyInvestments.stepThree.percentageInputLabel"
                )}
                type="number"
                placeholder={t(
                  "wizards.monthlyInvestments.stepThree.percentageInputPlaceholder"
                )}
                className="w-20"
                value={percentage}
                onChange={(event) =>
                  handleNumberInputEvent(
                    event,
                    wrapSetValue(setInput, security.id, "percentage"),
                    0,
                    100,
                    2
                  )
                }
                onPaste={(event) =>
                  handleNumberPasteEvent(
                    event,
                    wrapSetValue(setInput, security.id, "percentage"),
                    0,
                    100,
                    2
                  )
                }
                error={
                  (parseFloat(percentage) || 0) <= 0
                    ? " "
                    : (parseFloat(percentage) || 0) > 100
                    ? t(
                        "wizards.monthlyInvestments.stepThree.percentageInputOverError"
                      )
                    : ""
                }
              />
              <Input
                id={!id ? undefined : `${id}-amountInput`}
                label={t(
                  "wizards.monthlyInvestments.stepThree.amountInputLabel",
                  {
                    currency: portfolioCurrencyCode,
                  }
                )}
                type="number"
                placeholder="200"
                className="w-40"
                value={amount}
                onChange={(event) =>
                  handleNumberInputEvent(
                    event,
                    wrapSetValue(setInput, security.id, "absolute"),
                    0,
                    undefined,
                    2
                  )
                }
                onPaste={(event) =>
                  handleNumberPasteEvent(
                    event,
                    wrapSetValue(setInput, security.id, "absolute"),
                    0,
                    undefined,
                    2
                  )
                }
                error={
                  (parseFloat(amount) || 0) <= 0
                    ? " "
                    : minTradeAmountInPfCurrency &&
                      (parseFloat(amount) || 0) < minTradeAmountInPfCurrency
                    ? t(
                        "wizards.monthlyInvestments.stepThree.amountInputBelowMinError"
                      )
                    : ""
                }
              />
            </div>
            <p
              id={!id ? undefined : `${id}-minTradeAmountDisclaimer`}
              className="text-sm font-thin"
            >
              {t("wizards.monthlyInvestments.stepThree.minDisclaimer", {
                amount: security.minTradeAmount.toLocaleString(i18n.language, {
                  style: "currency",
                  currency: security.currency.securityCode,
                }),
              })}
              {}
            </p>
          </div>
        </div>
      </Card>
    </li>
  );
};

export default SecurityDistributionCard;
