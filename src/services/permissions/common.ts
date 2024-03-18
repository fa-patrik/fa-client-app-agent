import { Portfolio, PortfolioGroups } from "api/common/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";

export const isPortfolioInGroup = (
  portfolio: Portfolio,
  groupCode: PortfolioGroups
) => portfolio?.portfolioGroups?.some((group) => group.code === groupCode);

export const isPortfolioOptionInGroup = (
  portfolioOption: PortfolioOption,
  groupCode: PortfolioGroups
) => {
  const itCan =
    portfolioOption?.details &&
    isPortfolioInGroup(portfolioOption?.details, groupCode);
  if (itCan) return true;
  return false;
};
