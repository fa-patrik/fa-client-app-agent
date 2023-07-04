import { gql, useQuery } from "@apollo/client";
import { fallbackLanguage } from "i18n";
import { useKeycloak } from "providers/KeycloakProvider";

//with 1 sub portfolio depth
export const PORTFOLIO_BASIC_FIELDS = gql`
  fragment PortfolioBasicFields on Portfolio {
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
export const CONTACT_INFO_QUERY = gql`
  ${PORTFOLIO_BASIC_FIELDS}
  query GetContactInfo($contactId: Long) {
    contact(id: $contactId) {
      id
      contactId
      name
      language {
        locale
      }
      representees(onlyDirectRepresentees: true) {
        name
        id
        contactId
        portfolios {
          ...PortfolioBasicFields
        }
        representees {
          name
          contactId
        }
      }
      assetManagerPortfolios {
        primaryContact {
          contactId
          name
        }
      }
      portfolios {
        ...PortfolioBasicFields
      }
    }
  }
`;

export enum PortfolioStatus {
  Active = "A",
  Passive = "P",
  Closed = "C",
}

export enum PortfolioGroups {
  CANCEL_ORDER = "CP_CANCEL",
  DEPOSIT = "CP_DEPOSIT",
  WITHDRAW = "CP_WITHDRAWAL",
  TRADE = "CP_TRADING",
  HIDE = "CP_HIDE_PF",
  MONTHLY_INVESTMENTS = "CP_MONTHLYINVESTMENTS",
}

interface PortfolioGroup {
  code: PortfolioGroups;
}

export interface Representee {
  id: number;
  name: string;
  contactId: string;
  portfolios: Portfolio[];
  representees: [];
}

interface AssetManagerPortfolios {
  primaryContact: {
    contactId: string;
    name: string;
  };
}

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

interface KeyFigure {
  date: string;
  value: string | number | Date | boolean;
}
interface FiguresAsObject {
  latestValues: Record<string, KeyFigure>;
}

export interface Portfolio {
  id: number;
  name: string;
  status: string;
  shortName: string;
  parentPortfolios: {
    id: number;
  }[];
  portfolios: Portfolio[]; //sub portfolios
  currency: {
    securityCode: string;
  };
  portfolioGroups: PortfolioGroup[];
  profile: Profile | null;
  figuresAsObject: FiguresAsObject;
}

interface ContactInfoQuery {
  contact?: {
    id: number;
    contactId: string;
    name: string;
    representees: Representee[];
    assetManagerPortfolios: AssetManagerPortfolios[];
    language: {
      locale: string;
    };
    portfolios?: Portfolio[];
  };
}

export const useGetContactInfo = (callAPI = false, id?: string | number) => {
  const { linkedContact } = useKeycloak();
  const { loading, error, data, refetch } = useQuery<ContactInfoQuery>(
    CONTACT_INFO_QUERY,
    {
      variables: {
        contactId: id?.toString() || linkedContact?.toString(),
      },
      fetchPolicy: callAPI ? "cache-and-network" : "cache-first",
    }
  );
  const activeAndPassivePortfolios = !data?.contact?.portfolios?.length
    ? []
    : removeClosed(data?.contact?.portfolios);

  return {
    loading: loading,
    error: error,
    data: data && {
      contactId: data.contact?.id,
      _contactId: data.contact?.contactId,
      portfolios: activeAndPassivePortfolios,
      locale: data.contact?.language?.locale || fallbackLanguage,
      // all contact portfolios have same currency
      portfoliosCurrency:
        data.contact?.portfolios?.[0]?.currency.securityCode || "",
      representees: data?.contact?.representees,
      assetManagerPortfolios: data?.contact?.assetManagerPortfolios,
      name: data.contact?.name,
    },
    refetch,
  };
};

/**
 * Removes closed portfolios (recursively on all sub portfolios as well).
 * @param portfolios Raw portfolio data from FA
 * @returns active/pending portfolios
 */
export const removeClosed = (portfolios: Portfolio[]) => {
  const result = [] as Portfolio[];
  portfolios?.forEach((portfolio) => {
    if (portfolio.status !== PortfolioStatus.Closed) {
      const portfolios = removeClosed(portfolio.portfolios);
      result.push({
        ...portfolio,
        portfolios,
      });
    }
  });
  return result;
};
