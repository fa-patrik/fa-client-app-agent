export interface BaseReport {
  marketValue: number;
  valueChangeAbsolute: number;
  accountBalance: number;
  portfolio: {
    currency: {
      securityCode: string;
    };
  };
}

interface Summary<TReport extends BaseReport = BaseReport> {
  id: number;
  name: string;
  portfolioReport: TReport;
  isinCode: string;
}

export interface SecurityPosition {
  valueChangeAbsolute: number;
  amount: number;
  security: {
    id: number;
    name: string;
  };
}

interface DetailedReport extends BaseReport {
  securityPositions: SecurityPosition[];
}

type DetailedSummary = Summary<DetailedReport>;

interface Portfolio extends Summary {
  status: string;
  currency: {
    securityCode: string;
  };
}

export interface AllocationByType {
  code: string;
  name: string;
  figures: {
    shareOfTotal: number;
  };
}

export interface DetailedPortfolio extends DetailedSummary {
  currency: {
    securityCode: string;
  };
  analytics: {
    allocationTopLevel: {
      allocationByType: AllocationByType[];
    };
  };
}

export interface AllPortfolios extends DetailedSummary {
  portfolios: Portfolio[];
}

export interface AllPortfoliosQuery {
  contact: AllPortfolios;
}

export interface PortfolioQuery {
  portfolio: DetailedPortfolio;
}
