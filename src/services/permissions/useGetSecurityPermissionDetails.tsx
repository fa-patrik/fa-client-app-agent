import { gql, useQuery } from "@apollo/client";
import { SecurityGroup } from "api/types";

export interface SecurityPermissionDetailsQuery {
  security: {
    id: number;
    groups: SecurityGroup[];
    tagsAsSet: string[];
  };
}

export const SECURITY_TRADE_PERMISSION_DETAILS = gql`
  query GetSecurityTradePermissionDetails($securityId: Long) {
    security(id: $securityId) {
      id
      tagsAsSet
      groups {
        id
        code
        name
      }
    }
  }
`;

export const useGetSecurityPermissionDetails = (
  securityId: number | undefined
) => {
  const { loading, error, data } = useQuery<SecurityPermissionDetailsQuery>(
    SECURITY_TRADE_PERMISSION_DETAILS,
    {
      variables: {
        securityId: securityId,
      },
    }
  );

  return {
    loading,
    error,
    data: data?.security,
  };
};
