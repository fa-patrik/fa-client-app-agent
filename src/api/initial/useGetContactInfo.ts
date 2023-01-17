import { gql, useQuery } from "@apollo/client";
import { fallbackLanguage } from "i18n";
import { useKeycloak } from "providers/KeycloakProvider";
import { CancelOrderPermissionGroup } from "services/permissions/cancelOrder";
import {
  DepositPermissionGroup,
  WithdrawalPermissionGroup,
} from "services/permissions/money";
import { TradePermissionGroup } from "services/permissions/trade";

const CONTACT_INFO_QUERY = gql`
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
          id
          name
          shortName
          currency {
            securityCode
          }
          portfolioGroups {
            id
            code
          }
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
      }
    }
  }
`;

export enum PortfolioStatus {
  Active = "A",
  Passive = "P",
  Closed = "C",
}

interface PortfolioGroup {
  code:
    | typeof TradePermissionGroup
    | typeof DepositPermissionGroup
    | typeof WithdrawalPermissionGroup
    | typeof CancelOrderPermissionGroup;
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

export interface Portfolio {
  id: number;
  name: string;
  status: string;
  shortName: string;
  currency: {
    securityCode: string;
  };
  portfolioGroups: PortfolioGroup[];
}

export interface ContactInfoQuery {
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

export interface ContactsInfoQuery {
  contacts?: {
    name: string;
    representees: Representee[];
    assetManagerPortfolios: AssetManagerPortfolios[];
  }[];
}

export const useGetContactInfo = (
  callAPI = false,
  selectedContactId?: string | number,
  queryWithRepresentees?: boolean
) => {
  const { linkedContact } = useKeycloak();
  const { loading, error, data } = useQuery<ContactInfoQuery>(
    CONTACT_INFO_QUERY,
    {
      variables: {
        contactId: selectedContactId || linkedContact,
      },
      fetchPolicy: callAPI ? "cache-and-network" : "cache-first",
    }
  );

  return {
    loading: loading,
    error: error,
    data: data && {
      contactId: data.contact?.id,
      _contactId: data.contact?.contactId,
      portfolios:
        data.contact?.portfolios?.filter(
          (portfolio) => portfolio.status !== PortfolioStatus.Closed
        ) || [],
      locale: data.contact?.language?.locale || fallbackLanguage,
      // all contact portfolios have same currency
      portfoliosCurrency:
        data.contact?.portfolios?.[0]?.currency.securityCode || "",
      representees: data?.contact?.representees,
      assetManagerPortfolios: data?.contact?.assetManagerPortfolios,
      name: data.contact?.name,
    },
  };
};
