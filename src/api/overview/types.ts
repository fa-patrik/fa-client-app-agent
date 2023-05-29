export interface SecurityTypeData {
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    shareOfTotal: number;
  };
}

export interface SecurityData {
  security: { id: number };
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
  };
}

export interface SecurityTypeDataWithSecurityData extends SecurityTypeData {
  securities: SecurityData[];
}

export interface PortfolioCardData {
  code: string;
  name: string;
  portfolio: {
    id: number;
  };
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
  };
  securityTypes: SecurityTypeData[];
}

export interface ContactOverviewQuery {
  contact: {
    id: number;
    analytics: {
      contact: {
        firstAnalysis: {
          marketValue: number;
          tradeAmount: number;
        };
        parentPortfolios: PortfolioCardData[];
      };
    };
  };
}

export interface PortfolioOverviewQuery {
  analytics: {
    grouppedAnalytics: {
      portfolio: {
        id: number;
      };
      firstAnalysis: {
        marketValue: number;
        tradeAmount: number;
      };
      securityTypes: SecurityTypeDataWithSecurityData[];
    };
  };
}
