export interface Currency {
  id: string;
  securityCode: string;
  amountDecimalCount: number;
}

export interface AllowanceValue {
  startDate: string;
  endDate: string;
  value: number;
}

export interface PortfolioType {
  id: string;
  code: string;
  name: string;
}

export interface TaxWrapperChild {
  code: string;
}

export interface TaxWrapper {
  id: string;
  code: string;
  name: string;
  currency?: Currency;
  portfolioTypes?: PortfolioType[];
  children?: TaxWrapperChild[];
}

export interface Portfolio {
  id: number;
  shortName: string;
  name: string;
}

export interface Transaction {
  id: string;
}

export interface TaxEffect {
  id: string;
  date: string;
  value: number;
  manuallyCreated: boolean;
  taxEffectType: string;
  portfolio: Portfolio;
  transaction?: Transaction;
}

export interface TaxWrapperData {
  id: string;
  code: string;
  name: string;
  taxYearStartDate: string;
  currency: Currency;
  values: AllowanceValue[];
  portfolioTypes: PortfolioType[];
  transactionTypeSettings: Record<string, string>;
  children: TaxWrapper[];
  taxEffects: TaxEffect[];
}

export interface CalculatedTaxWrapperAllowance {
  calcDate: string;
  usedAllowance: number;
  remainingAllowance: number;
  taxWrapper: TaxWrapper;
}

export interface Contact {
  id: number;
  contactId: string;
  calculatedTaxWrapperAllowances: CalculatedTaxWrapperAllowance[];
}

export interface AllowanceCalculationParamsInput {
  taxWrapperCode: string;
  calcDate: string;
}