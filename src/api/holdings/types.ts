export interface AllocationBySecurity {
  code: string;
  name: string;
  security: {
    id: number;
    isinCode: string;
    countryCode: string;
    currencyCode: string;
    tagsAsList: string[];
  };
  figures: {
    marketValue: number;
    tradeAmount: number;
    fxRate: number;
    amount: number;
    purchaseTradeAmount: number;
  };
}

export interface AllocationByType {
  code: SecurityTypeCode;
  name: string;
  figures: {
    marketValue: number;
    tradeAmount: number;
  };
  allocationsBySecurity: AllocationBySecurity[];
}

export interface AllPortfoliosHoldingsQuery {
  contact: {
    analytics: {
      allocationTopLevel: {
        portfolio: {
          currencyCode: string;
        };
        allocationByType: AllocationByType[];
      };
    };
  };
}

export interface PortfolioHoldingsQuery {
  portfolio: {
    analytics: {
      allocationTopLevel: {
        portfolio: {
          currencyCode: string;
        };
        allocationByType: AllocationByType[];
      };
    };
  };
}

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
  securityCode: string;
  isinCode: string;
  url: string;
  url2: string;
  currency: {
    securityCode: string;
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
  fxRate: number;
  // misnamed on backend, should be tagsAsList
  tagsAsSet: string[];
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
  accruedInterest: number;
  purchaseTradeAmount: number;
  marketValue: number;
  valueChangeAbsolute: number;
  valueChangeRelative: number;
  marketFxRate: number;
}

export interface AllPortfoliosHoldingDetailsQuery {
  contact: {
    portfolioReport: {
      holdingPositions: HoldingPosition[];
    };
  };
}

export interface PortfolioHoldingDetailsQuery {
  portfolio: {
    portfolioReport: {
      holdingPositions: HoldingPosition[];
    };
  };
}
