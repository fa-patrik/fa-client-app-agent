import { useReducer } from "react";
import { gql, OperationVariables, useQuery } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { Option } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { tradableTag } from "services/permissions/usePermission";
import { getBackendTranslation } from "utils/backTranslations";
import { SecurityTypeCode } from "../holdings/types";
import { getFetchPolicyOptions } from "../utils";

const TRADABLE_SECURITIES_QUERY = gql`
  query GetTradableSecurities(
    $currency: String
    $countryCode: String
    $securityType: String
    $name: String
    $tradableTag: [String]
    $securityCode: String
  ) {
    securities(
      tags: $tradableTag
      countryCode: $countryCode
      securityType: $securityType
      name: $name
      securityCode: $securityCode
    ) {
      id
      name
      namesAsMap
      isinCode
      securityCode
      url
      url2
      country {
        id
        name
        code
        namesAsMap
      }
      latestMarketData {
        id
        date: obsDate
        price: closeView
      }
      type {
        id
        name
        code
        namesAsMap
      }
      currency {
        id
        securityCode
      }
      managementFee
      minTradeAmount
      fxRate(quoteCurrency: $currency)
    }
  }
`;

interface SecurityPrice {
  id: number;
  price: number;
  date: string;
}

export interface TradableSecurity {
  id: number;
  name: string;
  namesAsMap: Record<string, string>;
  securityCode: string;
  isinCode?: string;
  url: string;
  url2: string;
  latestMarketData?: SecurityPrice;
  currency: {
    securityCode: string;
  };
  country?: {
    code: string;
    name: string;
    namesAsMap: Record<string, string>;
  };
  type: {
    code: SecurityTypeCode;
    name: string;
    namesAsMap: Record<string, string>;
  };
  managementFee: number;
  minTradeAmount: number;
  fxRate: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TradableSecuritiesQuery {
  securities: TradableSecurity[];
}

interface SecurityFilterOption {
  id: string | null;
  label: string;
}

interface TradableSecuritiesFilters {
  country: Option;
  type: Option;
  name: string;
}

const filtersReducer = (
  filters: TradableSecuritiesFilters,
  newFilters: Partial<TradableSecuritiesFilters>
) => ({ ...filters, ...newFilters });

const emptyOption: SecurityFilterOption = {
  id: null,
  label: "-",
};

//initial values for filtering select & input components (empty)
const initialFilters = {
  country: emptyOption,
  type: emptyOption,
  name: "",
};

//initial selectable options for filtering select components (empty)
const filterOptionsInitial = {
  country: [emptyOption],
  type: [emptyOption],
};

export const useGetTradebleSecurities = (currencyCode?: string) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfoliosCurrency } = { portfoliosCurrency: "EUR" } } =
    useGetContactInfo(false, selectedContactId);
  const { i18n } = useModifiedTranslation();
  const locale = i18n.language;
  const [filters, setFilters] = useReducer(filtersReducer, initialFilters);

  const { loading, error, data } = useQuery<TradableSecuritiesQuery>(
    TRADABLE_SECURITIES_QUERY,
    {
      variables: {
        countryCode: filters.country.id,
        securityType: filters.type.id,
        name: filters.name,
        currency: currencyCode ?? portfoliosCurrency,
        tradableTag,
      },
      ...getFetchPolicyOptions(
        `useGetTradebleSecurities.${filters.country.id}.${filters.type.id}.${
          filters.name
        }.${currencyCode ?? portfoliosCurrency}`
      ),
    }
  );

  //derive the selectable options from the received security data, if any
  const filterOptions =
    data?.securities?.reduce((prev, curr) => {
      const securityCountry = curr.country;
      if (
        securityCountry &&
        !prev.country.some((country) => country.id === securityCountry.code)
      ) {
        prev.country.push({
          id: securityCountry.code,
          label: getBackendTranslation(
            securityCountry.name ?? "",
            securityCountry.namesAsMap,
            locale
          ),
        });
      }

      const securityType = curr.type;
      if (
        securityType &&
        !prev.type.some((type) => type.id === securityType.code)
      ) {
        prev.type.push({
          id: securityType.code,
          label: getBackendTranslation(
            securityType.name ?? "",
            securityType.namesAsMap,
            locale
          ),
        });
      }

      return prev;
    }, filterOptionsInitial) ?? filterOptionsInitial;

  return {
    loading,
    error,
    data: data?.securities,
    filters,
    setFilters,
    filterOptions,
  };
};

export const useGetTradebleSecurityLazy = () => {
  const client = useApolloClient();

  const getTradableSecurity = async (variables: OperationVariables) => {
    const result = await client.query({
      query: TRADABLE_SECURITIES_QUERY,
      variables,
    });
    return result;
  };

  return {
    getTradableSecurity,
  };
};

