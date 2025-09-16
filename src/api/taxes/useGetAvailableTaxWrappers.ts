import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";

const GET_AVAILABLE_TAX_WRAPPER_NAMES_AND_CODES = gql`
  query GetAvailableTaxWrapperNamesAndCodes {
    taxWrappers {
      id
      code
      name
      taxYearStartDate
    }
  }
`;

export interface TaxWrapper {
  id: string;
  code: string;
  name: string;
  taxYearStartDate: string;
}

export interface GetAvailableTaxWrappersData {
  taxWrappers: TaxWrapper[];
}

export const useGetAvailableTaxWrappers = () => {
  return useQuery<GetAvailableTaxWrappersData>(GET_AVAILABLE_TAX_WRAPPER_NAMES_AND_CODES);
};
