import { CashAccount } from "api/money/useGetPortfoliosAccounts";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

/**
 * This is the data structure that is produced
 * by the wizard and put in wizardData.data
 * Note that this is different than the type
 * required by the API, and will have to be converted
 * before being imported.
 */
export interface MonthlySavingsWizardState {
  selectedPortfolioOption: PortfolioOption | undefined;
  selectedAccount: CashAccount | undefined;
  amountToSave: number | undefined;
  selectedDate: string | undefined;
  selectedMonths: Record<string, boolean> | undefined;
}
