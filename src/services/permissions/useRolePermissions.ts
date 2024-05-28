import { useKeycloak } from "providers/KeycloakProvider";
import { AccessMode } from "services/keycloakService";

/**
 * Determines the permissions of the user based on their roles
 */
export const useRolePermissions = () => {
  const { accessMode } = useKeycloak();
  const canTrade =
    accessMode === AccessMode.REGULAR || accessMode === AccessMode.ADVISOR;
  const isImpersonator =
    accessMode === AccessMode.IMPERSONATOR || AccessMode.ADVISOR;
  const canSave =
    accessMode === AccessMode.REGULAR || accessMode === AccessMode.ADVISOR;
  return { canTrade, isImpersonator, canSave };
};
