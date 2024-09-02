import { useState } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { usePortfolioSelect } from "hooks/usePortfolioSelect";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PortfolioOptionFilterFunction } from "services/permissions/usePermission";
import { filterPortfolioOptionsByFunction } from "utils/options";

export const useFilteredPortfolioSelect = (
  filterFunction: PortfolioOptionFilterFunction
) => {
  const { linkedContact } = useKeycloak();
  const { portfolioOptions, selectedPortfolioId } = usePortfolioSelect();
  const { selectedContactId } = useGetContractIdData();
  const contactRepresentativeTags = useGetContactInfo(false, selectedContactId)
    ?.data?.representativeTags;
  const filteredPortfolioOptions = filterPortfolioOptionsByFunction(
    contactRepresentativeTags,
    portfolioOptions,
    linkedContact,
    filterFunction
  );

  const [portfolioId, setPortfolioId] = useState(() => {
    if (
      filteredPortfolioOptions.some(
        (option) => option.id === selectedPortfolioId
      )
    ) {
      return selectedPortfolioId;
    }
    return filteredPortfolioOptions[0]?.id;
  });

  const result = {
    portfolioId,
    setPortfolioId,
    portfolioOptions: filteredPortfolioOptions,
  };

  return result;
};
