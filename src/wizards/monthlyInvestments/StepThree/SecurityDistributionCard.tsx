import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { ReactComponent as CancelIcon } from "assets/cancel-circle.svg";
import { Button, Card, Input } from "components";
import SecurityInfoCell from "components/Table/TradableSecurityTable/SecurityInfoCell";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";

/**
 * Rounds to 3 decimals.
 * @param number
 * @returns
 */
const round = (number: number |undefined) => {
  if(number) return Math.round(number * 1000) / 1000;
  return number
};

interface SecurityDistributionCardProps {
  security: TradableSecurity;
  handleRemove: (security: TradableSecurity) => void;
  setInput: (input: string, securityId: number, mode: string) => void;
  percentageInputs: Record<string, number | undefined>;
  amountInputs: Record<string, number | undefined>;
  portfolioCurrencyCode: string;
}


const SecurityDistributionCard: React.FC<SecurityDistributionCardProps> = ({
  security,
  handleRemove,
  setInput,
  percentageInputs,
  amountInputs,
  portfolioCurrencyCode,
}) => {
  const { i18n } = useModifiedTranslation();

  const minTradeAmountInPfCurrency = security.minTradeAmount * security.fxRate;

  /** Ensures input is of max 2 decimals and positive */
  const handleInput = (
    event: React.FormEvent<HTMLInputElement>,
    securityId: number,
    mode: string
  ) => {
    const target = event.currentTarget;

    if (target instanceof HTMLInputElement) {
      let newValue = target.value.replace(/-/g, "");
      if (mode === "absolute") {
        const decimalIndex = target.value.indexOf(".");
        if (decimalIndex !== -1 && newValue.length - decimalIndex - 1 > 2) {
          newValue = newValue.slice(0, decimalIndex + 3); // trim after two decimal places
        }
      }
      setInput(newValue, securityId, mode);
    }
  };

  /** Ensures pasted input is of max 2 decimals and positive */
  const handlePaste = (
    event: React.ClipboardEvent,
    securityId: number,
    mode: string
  ) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text");
    const decimal = text.split(".")[1];
    if (!decimal || decimal.length <= 2) {
      setInput(text, securityId, mode);
    }
  };

  const {t} = useModifiedTranslation()
  return (
    <li id={`securityDistributionCard-${security.id}`}>
      <Card>
        <div className="flex flex-col gap-y-2 p-2">
          <div className="flex justify-between items-start">
            <SecurityInfoCell
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
                label={t("wizards.monthlyInvestments.stepThree.percentageInputLabel")}
                type="number"
                placeholder={t("wizards.monthlyInvestments.stepThree.percentageInputPlaceholder")}
                className="w-20 "
                value={round(percentageInputs[security.id])}
                onChange={(event) =>
                  handleInput(event, security.id, "percentage")
                }
                onPaste={(event) =>
                  handlePaste(event, security.id, "percentage")
                }
                error={
                  (percentageInputs[security.id] || 0) < 0
                    ? t("wizards.monthlyInvestments.stepThree.percentageInputBelowError")
                    : (percentageInputs[security.id] || 0) > 100
                    ? t("wizards.monthlyInvestments.stepThree.percentageInputOverError")
                    : undefined
                }
              />
              <Input
                label={t("wizards.monthlyInvestments.stepThree.amountInputLabel",{
                  currency: portfolioCurrencyCode
                })}
                type="number"
                placeholder="200"
                className="w-40"
                value={amountInputs[security.id]}
                onChange={(event) =>
                  handleInput(event, security.id, "absolute")
                }
                onPaste={(event) => handlePaste(event, security.id, "absolute")}
                error={
                  (amountInputs[security.id] || 0) < 0
                    ? t("wizards.monthlyInvestments.stepThree.amountInputBelowError")
                    : minTradeAmountInPfCurrency &&
                      (amountInputs[security.id] || 0) <
                        minTradeAmountInPfCurrency
                    ? t("wizards.monthlyInvestments.stepThree.amountInputBelowMinError")
                    : undefined
                }
              />
            </div>
            <p className="text-sm font-thin">
              {t("wizards.monthlyInvestments.stepThree.minDisclaimer",{
                amount: security.minTradeAmount.toLocaleString(i18n.language, {
                  style: "currency",
                  currency: security.currency.securityCode,
                })
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
