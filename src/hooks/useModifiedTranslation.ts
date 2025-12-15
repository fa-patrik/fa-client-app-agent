import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export const useModifiedTranslation = () => {
  const { i18n, t } = useTranslation();
  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;
  // for all languages currencies are displayed as ISO code at the end of value - business decision
  const modifiedT = useCallback(
    (key: string, options?: Record<string, unknown>): string => {
      if (key === "number") {
        return `${t("number", {
          ...options,
          locale: locale,
          maximumFractionDigits: 8,
        })}`;
      }

      if (key === "numberWithPercent") {
        return `${
          t("number", {
            ...options,
            locale: locale,
            maximumFractionDigits: 2,
          }) + "%"
        }`;
      }

      if (key === "numberWithCurrency") {
        if (options?.currency) {
          const { currency, ...optionsWOCurrency } = options;
          return `${t("number", {
            ...optionsWOCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            locale: locale,
          })}\xa0${currency}`;
        }
      }

      if (key === "numberWithCurrencyNoDecimals") {
        if (options?.currency) {
          const { currency, ...optionsWOCurrency } = options;
          return `${t("number", {
            ...optionsWOCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            locale: locale,
          })}\xa0${currency}`;
        }
      }

      if (key === "numberWithCurrencyRounded") {
        if (options?.currency) {
          const { currency, ...optionsWOCurrency } = options;
          return `${t("numberRounded", {
            ...optionsWOCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            locale: locale,
          })}\xa0${currency}`;
        }
      }

      return t(key, { ...options, locale }) as string;
    },
    [t, locale]
  );

  return { i18n, t: modifiedT };
};
