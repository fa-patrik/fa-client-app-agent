import { Portfolio, useGetContactInfo } from "api/initial/useGetContactInfo";
import { PortfolioOption } from "components/PortfolioSelect/PortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";

export const DepositPermissionGroup = "CP_DEPOSIT" as const;
export const WithdrawalPermissionGroup = "CP_WITHDRAWAL" as const;

export const isPortfolioDepositable = (portfolio: Portfolio) =>
  portfolio.portfolioGroups.some(
    (group) => group.code === DepositPermissionGroup
  );

export const isPortfolioOptionDepositable = (
  portfolioOption: PortfolioOption
) => {
  const isDepositable =
    portfolioOption.details && isPortfolioDepositable(portfolioOption.details);
  if (isDepositable) return true;
  return false;
};

export const useCanDeposit = () => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );
  return portfolios.some(isPortfolioDepositable);
};

export const isPortfolioWithdrawable = (portfolio: Portfolio) =>
  portfolio.portfolioGroups.some(
    (group) => group.code === WithdrawalPermissionGroup
  );

export const isPortfolioOptionWithdrawable = (
  portfolioOption: PortfolioOption
) => {
  const isWithdrawable =
    portfolioOption.details && isPortfolioWithdrawable(portfolioOption.details);
  if (isWithdrawable) return true;
  return false;
};

export const useCanWithdraw = () => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(false, selectedContactId);
  return portfolios.some(isPortfolioWithdrawable);
};
