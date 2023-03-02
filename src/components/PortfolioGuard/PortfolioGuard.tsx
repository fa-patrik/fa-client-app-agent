import { ReactNode, useEffect } from "react";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useNavigate, useParams } from "react-router-dom";
import { keycloakService } from "services/keycloakService";
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

  const { contactDbId } = useParams();

  //this data is expected to be null if the
  //user does not have access rights to the contactDbId
  const { data: viewAsContactData, loading: loadingViewAsContactData } =
    useGetContactInfo(false, contactDbId);

  useEffect(() => {
    if (contactDbId && viewAsContactData) {
      //keycloakService.setLinkedContact(contactDbId);
    }
  }, [contactDbId, viewAsContactData]);

  if (portfolios.length === 0) {
    return <NoPortfolios />;
  }

  return <>{children}</>;
};
