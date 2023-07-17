export interface SecurityTypeData {
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    shareOfTotal: number;
    [key: string]: number;
  };
}

export interface SecurityData {
  security: {
    id: number;
    isinCode: string;
    countryCode: string;
    currencyCode: string;
    tagsAsList: string[];
  };
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    amount: number;
    accruedInterest: number;
    purchaseTradeAmount: number;
    [key: string]: number;
  };
}

export interface SecurityTypeDataWithSecurityData extends SecurityTypeData {
  securities: SecurityData[];
}

export interface PortfolioData {
  portfolio: {
    id: number;
  };
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    [key: string]: number;
  };
  securityTypes: SecurityTypeDataWithSecurityData[];
}

export interface ContactOverviewQuery {
  contact: {
    id: number;
    analytics: {
      contact: {
        firstAnalysis: {
          marketValue: number;
          tradeAmount: number;
          [key: string]: number;
        };
        parentPortfolios: PortfolioData[];
      };
    };
  };
}

export interface PortfolioOverviewQuery {
  analytics: {
    grouppedAnalytics: PortfolioData;
  };
}
