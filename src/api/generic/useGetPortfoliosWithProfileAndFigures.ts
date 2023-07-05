import { gql, useQuery } from "@apollo/client";
import { getSubPortfolioIds } from "api/generic/useGetSubPortfolioIds";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { useKeycloak } from "providers/KeycloakProvider";
import {
  Portfolio,
  useGetContactInfo,
} from "../initial/useGetContactInfo";


export const PORTFOLIO_EXTENDED_FIELDS = gql`
  fragment PortfolioWithProfileAndFigures on Portfolio {
    id
    name
    status
    shortName
    currency {
      securityCode
    }
    portfolioGroups {
      id
      code
    }
    parentPortfolios {
      id
    }
    profile {
      id
      attributes {
        id
        attributeKey
        defaultValue
        doubleValue
        stringValue
        booleanValue
        dateValue
        intValue
      }
    }
    figuresAsObject {
      latestValues
    }
    portfolios {
      id
      name
      status
      shortName
      currency {
        securityCode
      }
      portfolioGroups {
        id
        code
      }
      profile {
        id
        attributes {
          id
          attributeKey
          defaultValue
          doubleValue
          stringValue
          booleanValue
          dateValue
          intValue
        }
      }
      figuresAsObject {
        latestValues
      }
    }
  }
`;

//maximum of 2 sub portfolio depth
export const PORTFOLIO_EXTENDED_DATA_QUERY = gql`
  ${PORTFOLIO_EXTENDED_FIELDS}
  query GetPortfoliosProfileAndFigures($portfolioIds: [String]) {
    portfolios(ids: $portfolioIds) {
        ...PortfolioWithProfileAndFigures
    }
  }
`;

export interface Attribute {
  id: number;
  attributeKey: string;
  defaultValue: string | number | Date | null;
  doubleValue: number | null;
  stringValue: string | null;
  booleanValue: boolean | null;
  dateValue: Date | null;
  intValue: number | null;
}

export interface Profile {
  id: number;
  attributes: Attribute[];
}

export interface KeyFigure {
  date: string;
  value: string | number | Date | boolean;
}
export interface FiguresAsObject {
  latestValues: Record<string, KeyFigure>;
}

interface PortfolioProfileAndFiguresQuery {
  portfolios: PortfolioWithProfileAndFigures[];
  
}
export interface PortfolioWithProfileAndFigures extends Portfolio{
  profile: Profile | null;
  figuresAsObject: FiguresAsObject | null;
}

export const useGetPortfoliosWithProfileAndFigures = (callAPI = false) => {
  const {linkedContact} = useKeycloak()
  const {selectedContactId} = useGetContractIdData()
  const { data: contactData } = useGetContactInfo(false, selectedContactId || linkedContact);
  const portfolioIds = contactData?.portfolios.reduce((prev, curr) => {
    const subIds = getSubPortfolioIds(curr)
    prev.push(curr.id,...subIds)
    return prev
  },[] as number[])

  const { loading, error, data, refetch } = useQuery<PortfolioProfileAndFiguresQuery>(
    PORTFOLIO_EXTENDED_DATA_QUERY,
    {
      variables: {
        portfolioIds: portfolioIds
      },
      fetchPolicy: callAPI ? "cache-and-network" : "cache-first",
    }
  );

  return {
    loading: loading,
    error: error,
    data: data,
    refetch,
  };
};
