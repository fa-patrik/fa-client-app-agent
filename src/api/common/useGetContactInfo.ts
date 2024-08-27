import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { SecurityGroup } from "api/types";
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
      amountDecimalCount
    }
    portfolioGroups {
      id
      code
    }
    securityGroups {
      id
      code
      name
      securities {
        id
      }
    }
    parentPortfolios {
      id
    }
    representativeTags {
      portfolioAssetManagers
      portfolioContacts
    }
    portfolios {
      id
      name
      status
      shortName
      currency {
        securityCode
        amountDecimalCount
      }
      portfolioGroups {
        id
        code
      }
      securityGroups {
        id
        code
        name
        securities {
          id
        }
      }
      representativeTags {
        portfolioAssetManagers
        portfolioContacts
      }
    }
  }
`;

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
        id
        name
        contactId
        portfolios {
          ...PortfolioBasicFields
        }
        representees {
          name
          contactId
        }
      }
      portfolios {
        ...PortfolioBasicFields
      }
      representativeTags {
        representatives
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
  MONTHLY_SAVINGS = "CP_MONTHLYSAVINGS",
}

export enum RepresentativeTag {
  CANCEL_ORDER = "Client portal:Cancel order",
  DEPOSIT = "Client portal:Deposit",
  WITHDRAW = "Client portal:Withdraw",
  TRADE = "Client portal:Trade",
  HIDE = "Client portal:Hide",
  MONTHLY_INVESTMENTS = "Client portal:Monthly investments",
  MONTHLY_SAVINGS = "Client portal:Monthly savings",
}

export interface PortfolioGroup {
  id: number;
  code: PortfolioGroups;
}

export interface Representee {
  id: number;
  name: string;
  contactId: string;
  portfolios: Portfolio[];
  representees: [];
}

export interface AssetManagerPortfolios {
  primaryContact: {
    contactId: string;
    name: string;
  };
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
    amountDecimalCount: number;
  };
  portfolioGroups: PortfolioGroup[];
  securityGroups: SecurityGroup[];
  representativeTags: {
    portfolioAssetManagers: Record<string, RepresentativeTag>;
    portfolioContacts: Record<string, RepresentativeTag>;
  };
}

export interface ContactInfoQuery {
  contact?: {
    id: number;
    contactId: string;
    name: string;
    representees: Representee[];
    language: {
      locale: string;
    };
    portfolios?: Portfolio[];
    representativeTags: {
      representatives: Record<string, RepresentativeTag>;
    };
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
  const activeAndPassivePortfolios = useMemo(
    () =>
      !data?.contact?.portfolios?.length
        ? []
        : removeClosed(data?.contact?.portfolios),
    [data?.contact?.portfolios]
  );

  return {
    loading: loading,
    error: error,
    data: data && {
      id: data?.contact?.id,
      contactId: data?.contact?.id,
      _contactId: data?.contact?.contactId,
      portfolios: activeAndPassivePortfolios,
      locale: data?.contact?.language?.locale || fallbackLanguage,
      // all contact portfolios have same currency
      portfoliosCurrency:
        activeAndPassivePortfolios?.[0]?.currency?.securityCode,
      representees: data?.contact?.representees,
      name: data?.contact?.name,
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
