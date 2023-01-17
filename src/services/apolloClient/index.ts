import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { LocalStorageWrapper, CachePersistor } from "apollo3-cache-persist";
import { API_URL } from "config";
import { keycloakService } from "../keycloakService";
import { isInstalled } from "../pwa";
import { persistenceMapper } from "./utils";

const mainLink = new HttpLink({
  uri: `${API_URL}/graphql`,
  fetchOptions: {
    mode: "cors",
  },
});

const authMiddleware = setContext(async (operation, { headers }) => {
  const token = await keycloakService.getToken();
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  };
});

const cache = new InMemoryCache({
  typePolicies: {
    Portfolio: {
      fields: {
        portfolioReport: {
          merge: (existing, incoming) => {
            return { ...existing, ...incoming };
          },
        },
        portfolioGroups: {
          merge: (existing, incoming) => {
            return incoming;
          },
        },
      },
    },
    Contact: {
      fields: {
        portfolioReport: {
          merge: (existing, incoming) => {
            return { ...existing, ...incoming };
          },
        },
      },
    },
    PortfolioReportItem: {
      keyFields: ["portfolioId", "security", ["id"]],
    },
    Document: {
      keyFields: ["identifier"],
    },
    Report: {
      keyFields: ["transactionId"],
    },
    TransactionType: {
      keyFields: ["typeCode"],
    }
  },
});

export const persistor = new CachePersistor({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
  maxSize: 20971520, // 20 MB
  persistenceMapper: persistenceMapper,
  key: "fa-client-cache-persist",
});

export const getPersistedApolloClient = async () => {
  await persistor.restore();

  if (!isInstalled) {
    persistor.pause();
  }

  return new ApolloClient({
    link: from([authMiddleware, mainLink]),
    cache,
  });
};
