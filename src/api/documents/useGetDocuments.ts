import { useQuery, gql } from "@apollo/client";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import { DOCUMENT_FIELDS } from "./fragments";
import { Document } from "./types";

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

interface AllDocumentsQuery {
  contact: {
    documents: Document[];
    portfolios: {
      id: number;
      documents: Document[];
    }[];
  };
}

const filterTags: string[] = ["Online"];

export const useGetDocuments = (portfolioIds?: string) => {
  const { linkedContact } = useKeycloak();
  const { selectedContactId } = useGetContractIdData();
  const { loading, error, data } = useQuery<AllDocumentsQuery>(
    ALL_DOCUMENTS_QUERY,
    {
      variables: {
        contactId: selectedContactId || linkedContact,
        filterTags,
      },
    }
  );

  const portfolioDocuments =
    data?.contact?.portfolios?.reduce((prev, currPortfolio) => {
      const portfolioDocuments = currPortfolio.documents;
      if (portfolioDocuments) prev.push(...portfolioDocuments);
      return prev;
    }, [] as Document[]) || [];

  return {
    loading,
    error,
    data: data && [...data.contact.documents, ...portfolioDocuments],
  };
};