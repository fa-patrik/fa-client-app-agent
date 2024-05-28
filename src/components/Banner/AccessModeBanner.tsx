import { useGetContactInfo } from "api/common/useGetContactInfo";
import { Severity } from "components/Alert/Alert";
import { useKeycloak } from "providers/KeycloakProvider";
import { AccessMode } from "services/keycloakService";
import { useRolePermissions } from "services/permissions/useRolePermissions";
import Banner from "./Banner";

export const AccessModeBanner = () => {
  const { linkedContact } = useKeycloak();
  const { data: linkedContactData } = useGetContactInfo(false, linkedContact);
  const { isImpersonator } = useRolePermissions();
  const { accessMode } = useKeycloak();

  if (!isImpersonator) return null;

  return (
    <Banner
      id="access-mode-banner"
      severity={Severity.Info}
      title={
        accessMode === AccessMode.ADVISOR
          ? "Advisor mode"
          : "Impersonation mode"
      }
      description={`Impersonating ${linkedContactData?.name}`}
    />
  );
};
