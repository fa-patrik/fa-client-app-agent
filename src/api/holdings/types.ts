import type { SecurityGroup } from "api/types";

export interface MarketHistoryDataPoint {
  price: number;
  date: string;
}

/** Standard solution Security type codes.*/
export enum SecurityTypeCode {
  EQUITY = "E", //Equity
  ETF = "CE", //Exchange-traded funds (ETFs)
  PRIVATE_EQUITY = "PE", //Private Equity
  DEBT_INSTRUMENT = "D", //Debt instruments
  COLLECTIVE_INVESTMENT_VEHICLE = "C", //Collective investment vehicles
  CURRENCY = "TC", //Currencies
}

/**
 * Security tags indicating whether a security can be bought or sold
 * in units and/or trade amount.
 */
export enum SecurityTradeType {
  buyUnits = "Trade type:Buy units",
  buyTradeAmount = "Trade type:Buy trade amount",
  sellUnits = "Trade type:Sell units",
  sellTradeAmount = "Trade type:Sell trade amount",
}

export interface SecurityDetailsPosition {
  id: number;
  name: string;
  namesAsMap: Record<string, string>;
  securityCode: string;
  isinCode: string;
  url: string;
  url2: string;
  currency: {
    securityCode: string;
    amountDecimalCount: number;
  };
  latestMarketData?: {
    price: number;
    date: string;
  };
  type: {
    code: SecurityTypeCode;
    namesAsMap: Record<string, string>;
    name: string;
  };
  tagsAsSet: string[];
  documents: {
    fileName: string;
    identifier: string;
    mimeType: string;
  }[];
  amountDecimalCount: number;
  groups: SecurityGroup[];
}

export interface SecurityDetailsQuery {
  security: SecurityDetailsPosition;
}

export interface SecurityMarketDataHistory {
  marketDataHistory: MarketHistoryDataPoint[];
}

export interface SecurityMarketDataHistoryQuery {
  security: SecurityMarketDataHistory;
}

export interface HoldingPosition {
  security: {
    id: number;
  };
  amount: number;
  purchaseTradeAmount: number;
  marketValue: number;
  marketFxRate: number;
}

export interface PortfolioHoldingDetailsQuery {
  portfolio: {
    portfolioReport: {
      holdingPositions: HoldingPosition[];
    };
  };
}

export interface ContactHoldingDetailsQuery {
  contact: {
    id: number;
    portfolios: {
      id: number;
      portfolioReport: {
        holdingPositions: HoldingPosition[];
      };
    }[];
  };
}

export interface AnalyticsSecurityTypeData {
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    shareOfTotal: number;
  } | null;
}

export interface AnalyticsSecurityData {
  security: {
    id: number;
    isinCode: string;
    countryCode: string;
    currencyCode: string;
    tagsAsList: string[];
    securityTypeCode: string;
    groups: SecurityGroup[];
  };
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    amount: number;
    accruedInterest: number;
    purchaseTradeAmount: number;
  } | null;
}

export interface AnalyticsSecurityTypeDataWithSecurityData
  extends AnalyticsSecurityTypeData {
  securities: AnalyticsSecurityData[];
}

export interface ContactHoldingsFromAnalyticsQuery {
  contact: {
    id: number;
    analytics: {
      contact: {
        firstAnalysis: {
          marketValue: number;
          tradeAmount: number;
        } | null;
        securityTypes: AnalyticsSecurityTypeDataWithSecurityData[];
      };
    };
  };
}

export interface AnalyticsPortfolioHoldingsData {
  portfolio: {
    id: number;
  };
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
  } | null;
  securityTypes: AnalyticsSecurityTypeData[];
}

export interface PortfolioHoldingsFromAnalyticsQuery {
  analytics: {
    grouppedAnalytics: AnalyticsPortfolioHoldingsData;
  };
}
