import { AuthUserRoutes } from "pages/authUser/routes";
import {
  UserWithLinkedContactReadonlyRoutes,
  UserWithLinkedContactRoutes,
} from "pages/userWithLinkedContact/routes";
import { DetailProvider } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { PersistedApolloProvider } from "providers/PersistedApolloProvider";

interface LinkedContactStackProps {
  readonly: boolean;
}

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

  if (!linkedContact) return <NoLinkedContactStack />;

  return <LinkedContactStack readonly={readonly} />;
};
