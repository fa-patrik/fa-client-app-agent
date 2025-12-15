import type { ReactNode } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { NoPortfolios } from "./components/NoPortfolios";

interface PortfolioGuardProps {
  children: ReactNode;
}

export const PortfolioGuard = ({ children }: PortfolioGuardProps) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfolios } = { portfolios: [] }, loading } =
    useGetContactInfo(false, selectedContactId);

  if (!loading && portfolios.length === 0) {
    return <NoPortfolios />;
  }

  return <>{children}</>;
};
