import { gql } from "@apollo/client";

export const DOCUMENT_FIELDS = gql`
  fragment DocumentFields on FileItem {
    identifier
    fileName
    created
    tags
  }
`;
