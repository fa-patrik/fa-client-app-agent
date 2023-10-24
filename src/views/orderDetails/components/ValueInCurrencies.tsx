import { useModifiedTranslation } from "hooks/useModifiedTranslation";

interface ValueInCurrenciesProps {
  valueInAccountCurrency: number;
  accountCurrencyCode?: string;
  valueInSecurityCurrency: number;
  securityCurrencyCode: string;
}

export const ValueInCurrencies = ({
  valueInAccountCurrency,
  accountCurrencyCode,
  valueInSecurityCurrency,
  securityCurrencyCode,
}: ValueInCurrenciesProps) => {
  const { t } = useModifiedTranslation();

  if (!accountCurrencyCode || securityCurrencyCode === accountCurrencyCode) {
    return (
      <div>
        {t("numberWithCurrency", {
          value: valueInSecurityCurrency,
          currency: securityCurrencyCode,
        })}
      </div>
    );
  }

  return (
    <>
      <div>
        {t("numberWithCurrency", {
          value: valueInAccountCurrency,
          currency: accountCurrencyCode,
        })}
      </div>
      <div className="text-sm font-medium leading-none text-gray-500">
        {t("numberWithCurrency", {
          value: valueInSecurityCurrency,
          currency: securityCurrencyCode,
        })}
      </div>
    </>
  );
};
