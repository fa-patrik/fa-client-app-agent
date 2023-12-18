import { gql, useQuery } from "@apollo/client";
import { getFetchPolicyOptions } from "../utils";

const SECURITY_FX_QUERY = gql`
  query GetFx($currencyCode: String, $securityCode: String) {
    securities(securityCode: $securityCode) {
      id
      fxRate(quoteCurrency: $currencyCode)
    }
  }
`;

interface SecurityFx {
  id: number;
  fxRate: number;
}

export interface SecurityFxQuery {
  securities: SecurityFx[];
}

export const useGetSecurityFx = (
  securityCode: string | undefined,
  currencyCode: string | undefined
) => {
  const { loading, error, data } = useQuery<SecurityFxQuery>(
    SECURITY_FX_QUERY,
    {
      skip: !securityCode || !currencyCode,
      variables: {
        securityCode: securityCode,
        currencyCode: currencyCode,
      },
      ...getFetchPolicyOptions(
        `useGetSecurityFx.${securityCode}.${currencyCode}`
      ),
    }
  );

  return {
    loading,
    error,
    data: data?.securities,
  };
};
