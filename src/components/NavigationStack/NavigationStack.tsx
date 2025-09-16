import { AuthUserRoutes } from "pages/authUser/routes";
import {
  UserWithImpersonationRightsRoutes,
  UserWithLinkedContactRoutes,
} from "pages/userWithLinkedContact/routes";
import { DetailProvider } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";
import { TaxesNotificationProvider } from "providers/TaxesNotificationProvider";
import { NotFoundView } from "views/notFoundView/notFoundView";

/**
 * Returns the remaining application stack
 * and deducts which routes to expose to the user.
 */
export const NavigationStack = () => {
  const { linkedContact, access } = useKeycloak();
  const NoLinkedContactStack = () => {
    return (
      <PersistedApolloProvider>
        <AuthUserRoutes />
      </PersistedApolloProvider>
    );
  };

  const DefaultStack = () => {
    return (
      <PersistedApolloProvider>
        <TaxesNotificationProvider>
          <DetailProvider>
            <UserWithLinkedContactRoutes />
          </DetailProvider>
        </TaxesNotificationProvider>
      </PersistedApolloProvider>
    );
  };

  const ImpersonationStack = () => {
    return (
      <PersistedApolloProvider>
        <TaxesNotificationProvider>
          <DetailProvider>
            <UserWithImpersonationRightsRoutes />
          </DetailProvider>
        </TaxesNotificationProvider>
      </PersistedApolloProvider>
    );
  };

  if (access.impersonate) return <ImpersonationStack />;

  if (linkedContact) return <DefaultStack />;

  if (!linkedContact) return <NoLinkedContactStack />;

  //fallback
  return <NotFoundView />;
};
