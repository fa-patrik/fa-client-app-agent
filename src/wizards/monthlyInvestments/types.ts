import { TradableSecurity } from "api/trading/useGetTradebleSecurities";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

/**
 * This is the data structure that is produced
 * by the wizard and put in wizardData.data
 * Note that this is different than the type
 * required by the API, and will have to be converted
 * before being imported.
 */
export interface MonthlyInvestmentsWizardState {
  isEditing?: boolean;
  selectedPortfolioOption: PortfolioOption | undefined;
  amountToInvest: number | undefined;
  selectedSecurities: TradableSecurity[] | undefined;
  amountDistribution: Record<TradableSecurity["id"], number> | undefined;
  percentageDistribution: Record<TradableSecurity["id"], number> | undefined;
  selectedDate: string | undefined;
  selectedMonths: Record<string, boolean> | undefined;
}
