import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import {
  SECURITY_TRADE_PERMISSION_DETAILS,
  SecurityPermissionDetailsQuery,
} from "./useGetSecurityPermissionDetails";

/**
 * Gets the details needed to deduct the tradability of securities; tags and security groups.
 * Makes an api-request per security id, since the securities api does not support querying
 * multiple ids at once.
 * @param securityIds the ids of the securities to get
 * @returns security groups and tags of the securities.
 */
export const useGetSecuritiesPermissionDetails = (securityIds: number[]) => {
  const [securityData, setSecurityData] = useState<
    SecurityPermissionDetailsQuery["security"][] | undefined
  >(undefined);
  const [error, setError] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const client = useApolloClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tempErrors = [];
      const tempSecurityData = [];
      for (const id of securityIds) {
        try {
          const response = await client.query<SecurityPermissionDetailsQuery>({
            query: SECURITY_TRADE_PERMISSION_DETAILS,
            variables: {
              securityId: id,
            },
          });

          if (response.data.security) {
            tempSecurityData.push(response.data.security);
          }
        } catch (error) {
          if (error instanceof Error) {
            tempErrors.push(
              `Failed fetching security permissions for id ${id}: ${error.message}`
            );
            console.error(error);
          }
        }
      }
      setSecurityData(tempSecurityData);
      if (tempErrors.length) {
        setError(tempErrors);
      }
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [securityIds]);

  return { data: securityData, loading, error };
};
