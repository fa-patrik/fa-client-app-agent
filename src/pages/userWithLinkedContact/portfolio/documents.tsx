import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetDocuments } from "api/documents/useGetDocuments";
import { QueryLoadingWrapper } from "components";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { useParams } from "react-router-dom";
import { Documents } from "views/documents/documents";

export const DocumentsPage = () => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { portfolioId } = useParams();
  const portfolioIdAsNumber = portfolioId ? Number(portfolioId) : undefined;
  const { data } = useGetContactInfo(false, selectedContactId ?? linkedContact);
  const numberOfPortfolios = data?.portfolios?.length ?? 0;
  const queryData = useGetDocuments(
    //we get the portfolio specific docs if there is more than one portfolio
    //and the user has selected a specific portfolio
    //otherwise we get all documents, because the user cannot select 'total investments' in the dropdown
    portfolioIdAsNumber !== undefined && numberOfPortfolios !== 1
      ? portfolioIdAsNumber
      : undefined
  );
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Documents} />;
};
