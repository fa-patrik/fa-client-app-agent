import { AuthUserRoutes } from "pages/authUser/routes";
import {
  UserWithLinkedContactReadonlyRoutes,
  UserWithLinkedContactRoutes,
} from "pages/userWithLinkedContact/routes";
import { DetailProvider } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";

interface LinkedContactStackProps {
  /**Whether user has readonly rights. */
  readonly: boolean;
}

/**
 * Returns the rest of the application stack
 * and routes. Deducts routes based on whether
 * the user has a linked contact and if the user
 * has a readonly role.
 */
export const NavigationStack = () => {
  const { readonly, linkedContact } = useKeycloak();

  const NoLinkedContactStack = () => {
    return (
      <PersistedApolloProvider>
        <AuthUserRoutes />
      </PersistedApolloProvider>
    );
  };

  const LinkedContactStack = ({ readonly }: LinkedContactStackProps) => {
    return (
      <PersistedApolloProvider>
        <DetailProvider>
          {readonly ? (
            <UserWithLinkedContactReadonlyRoutes />
          ) : (
            <UserWithLinkedContactRoutes />
          )}
        </DetailProvider>
      </PersistedApolloProvider>
    );
  };

  //user does not have linked contact in FA
  if (!linkedContact) return <NoLinkedContactStack />;

  //user has a linked contact in FA
  return <LinkedContactStack readonly={readonly} />;
};
