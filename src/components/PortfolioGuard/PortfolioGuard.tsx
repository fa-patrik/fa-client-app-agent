import { ReactNode } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { NoPortfolios } from "./components/NoPortfolios";

interface PortfolioGuardProps {
  children: ReactNode;
}

export const PortfolioGuard = ({ children }: PortfolioGuardProps) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] } } = useGetContactInfo(
    false,
    selectedContactId
  );

  if (portfolios.length === 0) {
    return <NoPortfolios />;
  }

  return <>{children}</>;
};
