import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import type { ApolloClient } from "@apollo/client/core/ApolloClient";
import { getPersistedApolloClient } from "services/apolloClient";
import { LoadingIndicator } from "../components";

interface PersistedApolloProviderProps {
  children: ReactNode;
}

export const PersistedApolloProvider = ({
  children,
}: PersistedApolloProviderProps) => {
  const [client, setClient] = useState<ApolloClient<unknown>>();

  useEffect(() => {
    async function init() {
      const client = await getPersistedApolloClient();
      setClient(client);
    }

    try {
      init();
    } catch (error) {
      console.error(error);
    }
  }, []);

  if (!client) {
    return (
      <div className="h-screen">
        <LoadingIndicator center />
      </div>
    );
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
