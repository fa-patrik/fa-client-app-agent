import { useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import { getFetchPolicyOptions } from "api/utils";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { DOCUMENT_FIELDS } from "./fragments";
import type { Document } from "./types";

const ALL_DOCUMENTS_QUERY = gql`
  ${DOCUMENT_FIELDS}
  query GetAllDocuments($contactId: Long, $filterTags: [String]) {
    contact(id: $contactId) {
      id
      documents(filterTags: $filterTags) {
        ...DocumentFields
      }
      portfolios {
        id
        documents(filterTags: $filterTags) {
          ...DocumentFields
        }
      }
    }
  }
`;

const PORTFOLIO_DOCUMENTS_QUERY = gql`
  ${DOCUMENT_FIELDS}
  query GetPortfolioDocuments($portfolioId: Long, $filterTags: [String]) {
    portfolio(id: $portfolioId) {
      id
      documents(filterTags: $filterTags) {
        ...DocumentFields
      }
    }
  }
`;

interface AllDocumentsQuery {
  contact: {
    id: number;
    documents: Document[];
    portfolios: {
      id: number;
      documents: Document[];
    }[];
  };
}

interface PortfolioDocumentsQuery {
  portfolio: {
    id: number;
    documents: Document[];
  };
}

const filterTags: string[] = ["Online"];

const getDocuments = (
  portfolios:
    | {
        id: number;
        documents: Document[];
      }[]
    | undefined
) => {
  return portfolios?.reduce((prev, currPortfolio) => {
    const portfolioDocuments = currPortfolio.documents;
    if (portfolioDocuments) prev.push(...portfolioDocuments);
    return prev;
  }, [] as Document[]);
};

/**
 * Fetches all documents for a contact or a specific portfolio
 * @param portfolioId the id of the portfolio to fetch documents for
 * @returns the loading state, error and data
 */
export const useGetDocuments = (portfolioId?: number) => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const contactId = selectedContactId ?? linkedContact;
  const getAllDocuments = portfolioId === undefined;
  const {
    loading: loadingAllDocuments,
    error: errorAllDocuments,
    data: dataAllDocuments,
  } = useQuery<AllDocumentsQuery>(ALL_DOCUMENTS_QUERY, {
    variables: {
      contactId,
      filterTags,
    },
    ...getFetchPolicyOptions(`useGetAllDocuments.${contactId}`),
    skip: !getAllDocuments,
  });

  const {
    loading: loadingPfDocuments,
    error: errorPfDocuments,
    data: dataPfDocuments,
  } = useQuery<PortfolioDocumentsQuery>(PORTFOLIO_DOCUMENTS_QUERY, {
    variables: {
      portfolioId,
      filterTags,
    },
    ...getFetchPolicyOptions(`useGetPortfolioDocuments.${portfolioId}`),
    skip: getAllDocuments,
  });

  const loading = loadingAllDocuments || loadingPfDocuments;
  const error = errorAllDocuments || errorPfDocuments;

  const allPortfolioDocuments = useMemo(() => {
    return getDocuments(dataAllDocuments?.contact?.portfolios);
  }, [dataAllDocuments?.contact?.portfolios]);

  const selectedPortfolioDocuments = useMemo(() => {
    return getDocuments(
      dataPfDocuments?.portfolio ? [dataPfDocuments?.portfolio] : undefined
    );
  }, [dataPfDocuments?.portfolio]);

  const contactDocuments = dataAllDocuments?.contact?.documents;

  //we don't want to default data to an empty array, as we want to know if the data is still loading
  let data;

  if (allPortfolioDocuments?.length && contactDocuments?.length) {
    data = [...allPortfolioDocuments, ...contactDocuments];
  } else if (allPortfolioDocuments?.length) {
    data = allPortfolioDocuments;
  } else if (contactDocuments?.length) {
    data = contactDocuments;
  } else if (selectedPortfolioDocuments?.length) {
    data = selectedPortfolioDocuments;
  } else {
    data = loadingAllDocuments || loadingPfDocuments ? undefined : [];
  }

  return {
    loading,
    error,
    data,
  };
};
