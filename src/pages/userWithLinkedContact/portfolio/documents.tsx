import { useGetContactInfo } from "api/common/useGetContactInfo";
import { useGetSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
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
  const selectedPortfolioId = portfolioId ? Number(portfolioId) : undefined;
  const { data } = useGetContactInfo(false, selectedContactId ?? linkedContact);
  const subPfIds = useGetSubPortfolioIds(selectedPortfolioId, false);

  const parentPortfolios = data?.portfolios.filter(
    (p) => !subPfIds.includes(p.id)
  );

  const onlyOneParentPortfolioAndItIsSelected =
    (parentPortfolios?.length ?? 0) === 1 &&
    selectedPortfolioId === parentPortfolios?.[0].id;

  const queryData = useGetDocuments(
    onlyOneParentPortfolioAndItIsSelected ? undefined : selectedPortfolioId
  );
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Documents} />;
};
