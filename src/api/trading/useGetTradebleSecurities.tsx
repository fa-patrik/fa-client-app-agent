import { useReducer, useState } from "react";
import { ApolloError, gql, OperationVariables, useQuery } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import { useGetContactInfo } from "api/common/useGetContactInfo";
import { SecurityGroup } from "api/types";
import { Option } from "components/Select/Select";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useGetContractIdData } from "providers/ContractIdProvider";
import { tradableTag } from "services/permissions/trading";
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
    securities: securitiesByParameters(
    parameters: {tags: $tradableTag, countryCode: $countryCode, securityType: $securityType, name: $name, securityCode: $securityCode},
    batchLoadLatestPrices: true
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
      groups {
        id
        code
        name
      }
      managementFee
      managementFeePercentage
      minTradeAmount
      fxRate(quoteCurrency: $currency)
      amountDecimalCount
      tagsAsSet
    }
  }
`;

interface SecurityPrice {
  id: number;
  price: number;
  date: string;
}

export interface TradableSecurityType {
  id: number;
  name: string;
  code: SecurityTypeCode;
  namesAsMap: Record<string, string>;
}

export interface TradableSecurity {
  id: number;
  name: string;
  namesAsMap: Record<string, string>;
  securityCode: string;
  isinCode: string | null;
  url: string | null;
  url2: string | null;
  latestMarketData: SecurityPrice | null;
  currency: {
    id: number;
    securityCode: string;
  };
  country: {
    id: number;
    code: string;
    name: string;
    namesAsMap: Record<string, string>;
  } | null;
  type: TradableSecurityType;
  managementFee: number;
  managementFeePercentage: number;
  minTradeAmount: number;
  fxRate: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  amountDecimalCount: number;
  groups: SecurityGroup[];
  tagsAsSet: string[];
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

export type GetTradableSecuritiesProps = {
  currencyCode?: string;
  tags?: string[];
};

export const useGetTradebleSecurities = (
  currencyCode?: string,
  tags?: string[]
) => {
  const { selectedContactId } = useGetContractIdData();
  const { data: { portfoliosCurrency } = { portfoliosCurrency: "EUR" } } =
    useGetContactInfo(false, selectedContactId);
  const { i18n } = useModifiedTranslation();
  const [filters, setFilters] = useReducer(filtersReducer, initialFilters);

  const { loading, error, data } = useQuery<TradableSecuritiesQuery>(
    TRADABLE_SECURITIES_QUERY,
    {
      variables: {
        countryCode: filters.country.id,
        securityType: filters.type.id,
        name: filters.name,
        currency: currencyCode ?? portfoliosCurrency,
        tradableTag: tags ? [...tags, tradableTag] : [tradableTag],
      },
      ...getFetchPolicyOptions(
        `useGetTradebleSecurities.${filters.country.id}.${filters.type.id}.${
          filters.name
        }.${currencyCode ?? portfoliosCurrency}.${tags}`
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
            securityCountry.name,
            securityCountry.namesAsMap,
            i18n.language,
            i18n.resolvedLanguage
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
            securityType.name,
            securityType.namesAsMap,
            i18n.language,
            i18n.resolvedLanguage
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
  const [error, setError] = useState<ApolloError | undefined>();
  const client = useApolloClient();

  const getTradableSecurity = async (variables: OperationVariables) => {
    try {
      const result = await client.query({
        query: TRADABLE_SECURITIES_QUERY,
        variables,
      });

      // Emulate an error for development
      // Uncomment below lines to emulate an error
      //const error = new ApolloError({ errorMessage: "Emulated error" });
      //throw error;

      setError(undefined);
      return result;
    } catch (err) {
      if (err instanceof ApolloError) setError(err);
    }
  };

  return {
    getTradableSecurity,
    error,
  };
};
