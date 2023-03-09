import { AuthUserRoutes } from "pages/authUser/routes";
import {
  UserWithImpersonationRightsRoutes,
  UserWithLinkedContactRoutes,
} from "pages/userWithLinkedContact/routes";
import { DetailProvider } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";
import { NotFoundView } from "views/notFoundView/notFoundView";

/**
 * Returns the rest of the application stack
 * and routes. Deducts routes based on whether
 * the user has a linked contact and if the user
 * has a readonly role.
 */
export const NavigationStack = () => {
  const { linkedContact, impersonating } = useKeycloak();

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
        <DetailProvider>
          <UserWithLinkedContactRoutes />
        </DetailProvider>
      </PersistedApolloProvider>
    );
  };

  const ImpersonationStack = () => {
    return (
      <PersistedApolloProvider>
        <DetailProvider>
          <UserWithImpersonationRightsRoutes />
        </DetailProvider>
      </PersistedApolloProvider>
    );
  };

  if (impersonating) return <ImpersonationStack />;

  if (linkedContact) return <DefaultStack />;

  if (!linkedContact) return <NoLinkedContactStack />;

  //fallback
  return <NotFoundView />;
};
