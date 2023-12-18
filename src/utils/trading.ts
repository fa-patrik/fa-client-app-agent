import { SecurityDetailsPosition, SecurityTradeType } from "api/holdings/types";
import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { TOptions, StringMap } from "i18next";
import { getBackendTranslation } from "./backTranslations";

/**
 * Distributes a trade amount with arbitrary decimals precision.
 * @param total the trade amount to distribute.
 * @param numSecurities nr of securities to distribute trade amount to.
 * @param decimals number of decimal places to maintain.
 * @returns A list of suggested trade amounts that should always summarize
 * to exactly the total.
 */
export function distributeTradeAmount(
  total: number,
  numSecurities: number,
  decimals = 2
): number[] {
  if (total <= 0 || numSecurities <= 0) {
    return [];
  }

  const scale = Math.pow(10, decimals);
  const scaledTotal = Math.round(total * scale);
  const baseAmount = Math.floor(scaledTotal / numSecurities);
  const remaining = scaledTotal - baseAmount * numSecurities;

  const distribution = new Array(numSecurities).fill(baseAmount);

  for (let i = 0; i < remaining; i++) {
    distribution[i]++;
  }

  return distribution.map((amount) => amount / scale);
}

export const getAllowedTradeTypesForSecurity = (
  securityTags: string[] | undefined
): Record<SecurityTradeType, boolean> => {
  if (!securityTags)
    return {
      "Trade type:Sell units": false,
      "Trade type:Sell trade amount": false,
      "Trade type:Buy units": false,
      "Trade type:Buy trade amount": false,
    };
  return securityTags.reduce(
    (prev, currTag) => {
      if (currTag === SecurityTradeType.sellUnits) {
        prev["Trade type:Sell units"] = true;
      } else if (currTag === SecurityTradeType.sellTradeAmount) {
        prev["Trade type:Sell trade amount"] = true;
      } else if (currTag === SecurityTradeType.buyUnits) {
        prev["Trade type:Buy units"] = true;
      } else if (currTag === SecurityTradeType.buyTradeAmount) {
        prev["Trade type:Buy trade amount"] = true;
      }
      return prev;
    },
    {
      "Trade type:Sell units": false,
      "Trade type:Sell trade amount": false,
      "Trade type:Buy units": false,
      "Trade type:Buy trade amount": false,
    } as Record<SecurityTradeType, boolean>
  );
};

export const getTradeAmountTooltip = (
  units: number,
  security: TradableSecurity | SecurityDetailsPosition,
  fxRate: number,
  portfolioCurrency: string,
  locale: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: TOptions<StringMap> | undefined) => any
): string | undefined => {
  try {
    const securityName = security
      ? getBackendTranslation(security.name, security.namesAsMap, locale)
      : "";

    const unitsFormatted =
      units !== undefined
        ? t("number", {
            value: units,
          })
        : undefined;

    const price = `${security?.latestMarketData?.price} ${security.currency.securityCode}`;

    const securityToPortfolioFx =
      fxRate !== undefined ? t("number", { value: fxRate }) : undefined;

    const securityPriceDate =
      security.latestMarketData?.date !== undefined
        ? new Date(security.latestMarketData?.date).toLocaleDateString(locale, {
            dateStyle: "medium",
          })
        : undefined;

    if (units && price && securityName && security.latestMarketData?.price) {
      if (
        securityToPortfolioFx &&
        security?.currency.securityCode &&
        portfolioCurrency &&
        security.currency.securityCode !== portfolioCurrency
      ) {
        const breakdownWithFx: string = t(
          "switchOrderModal.tradeAmountDisclaimerWithFx",
          {
            units: unitsFormatted,
            securityName: securityName,
            price: price,
            date: securityPriceDate,
            fxRate: securityToPortfolioFx,
            fx1: security.currency.securityCode,
            fx2: portfolioCurrency,
          }
        );
        return breakdownWithFx;
      } else {
        const breakdown: string = t("switchOrderModal.tradeAmountDisclaimer", {
          units: unitsFormatted,
          securityName: securityName,
          price: price,
          date: securityPriceDate,
        });
        return breakdown;
      }
    }
  } catch (error) {
    console.debug("Error creating calculation details string", error);
  }

  return undefined;
};

export const getBlockSizeErrorTooltip = (
  securityPriceInPfCurrency: number,
  security: TradableSecurity | SecurityDetailsPosition,
  fxRate: number,
  portfolioCurrency: string,
  locale: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: TOptions<StringMap> | undefined) => any,
  buy: boolean
): string | undefined => {
  try {
    const sellSecurityName = security
      ? getBackendTranslation(security.name, security.namesAsMap, locale)
      : "";

    const sellPrice = `${security?.latestMarketData?.price} ${security.currency.securityCode}`;

    const sellSecurityToPortfoliofxRate = fxRate
      ? t("number", { value: fxRate })
      : undefined;

    const securityPriceDate =
      security.latestMarketData?.date !== undefined
        ? new Date(security.latestMarketData?.date).toLocaleDateString(locale, {
            dateStyle: "medium",
          })
        : undefined;

    if (
      securityPriceInPfCurrency &&
      sellPrice &&
      sellSecurityName &&
      security.latestMarketData?.price
    ) {
      if (
        sellSecurityToPortfoliofxRate &&
        security?.currency.securityCode &&
        portfolioCurrency &&
        security.currency.securityCode !== portfolioCurrency
      ) {
        const breakdownWithFx: string = t(
          buy
            ? "tradingModal.buyBlockSizeErrorWithFx"
            : "tradingModal.sellBlockSizeErrorWithFx",
          {
            tradeAmount: t("numberWithCurrency", {
              value: securityPriceInPfCurrency,
              currency: portfolioCurrency,
            }),
            securityName: sellSecurityName,
            price: sellPrice,
            date: securityPriceDate,
            fxRate: sellSecurityToPortfoliofxRate,
            fx1: security.currency.securityCode,
            fx2: portfolioCurrency,
          }
        );
        return breakdownWithFx;
      } else {
        const breakdown: string = t(
          buy
            ? "tradingModal.buyBlockSizeErrorWithFx"
            : "tradingModal.sellBlockSizeErrorWithFx",
          {
            tradeAmount: t("numberWithCurrency", {
              value: securityPriceInPfCurrency,
              currency: portfolioCurrency,
            }),
            securityName: sellSecurityName,
            price: sellPrice,
            date: securityPriceDate,
          }
        );
        return breakdown;
      }
    }
  } catch (error) {
    console.debug("Error creating calculation details string", error);
  }

  return undefined;
};

export const getBlockSizeMinTradeAmount = (
  securityBlockSize: number,
  securityPrice: number
) => {
  const fraction = 1 / 10 ** securityBlockSize;
  const blockSizeMinTradeAmount = fraction * securityPrice;

  return blockSizeMinTradeAmount;
};
