import { useMemo } from "react";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { 
  PortfolioGroups,
  RepresentativeTag,
} from "api/common/useGetContactInfo";
import { useGetClientTaxAllowancesWithWrappers } from "api/taxes/useGetClientTaxAllowancesWithWrappers";
import { NavTabPath } from "layouts/NavTabLayout/NavTab/types";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { PermissionMode, useFeature } from "services/permissions/usePermission";

export const useFilteredTabRoutes = (routes: NavTabPath[]) => {
  // Get contact information for tax allowances check
  const { selectedContactId } = useGetContractIdData();
  const { data: contactInfo } = useGetContactInfo(false, selectedContactId);
  const contactCode = contactInfo?._contactId;

  // Check user's tax allowance configuration instead of available tax wrappers
  const { data: taxAllowancesData, loading: taxAllowancesLoading } = useGetClientTaxAllowancesWithWrappers({
    contactId: contactCode || "",
    skip: !contactCode,
  });

  const { canFeature: canTrade } = useFeature(
    PortfolioGroups.TRADE,
    RepresentativeTag.TRADE,
    PermissionMode.SELECTED_ANY
  );
  
  const filteredRoutes = useMemo(() => {
    // Show taxes tab if user has tax configuration (even if values are null)
    // This means the user has some tax allowance setup in the system
    const hasUserTaxConfig = taxAllowancesData?.hasUserTaxConfig || false;
    
    return routes.filter(route => {
      // Filter taxes tab based on user's tax allowance configuration
      if (route.path === "taxes") {
        return hasUserTaxConfig;
      }
      // Filter trading tab based on permissions
      if (route.path === "trading") {
        return canTrade;
      }
      return true;
    });
  }, [routes, taxAllowancesData?.hasUserTaxConfig, canTrade]);
  
  return {
    filteredRoutes,
    hasUserTaxConfig: taxAllowancesData?.hasUserTaxConfig || false,
    taxAllowancesLoading,
    canTrade
  };
};
