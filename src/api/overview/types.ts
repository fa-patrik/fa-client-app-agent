import { AnalyticsSecurityTypeDataWithSecurityData } from "api/holdings/types";

export interface PortfolioData {
  portfolio: {
    id: number;
  };
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
  } | null;
  securityTypes: AnalyticsSecurityTypeDataWithSecurityData[];
}

export interface ContactOverviewQuery {
  contact: {
    id: number;
    analytics: {
      contact: {
        firstAnalysis: {
          marketValue: number;
          tradeAmount: number;
        } | null;
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
