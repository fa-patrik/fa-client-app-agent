import { useMemo } from "react";
import type {
  AnalyticsSecurityData,
  AnalyticsSecurityTypeDataWithSecurityData,
} from "api/holdings/types";
import { SecurityTypeCode } from "api/holdings/types";

export const useSecuritiesSummary = (
  securityTypes: AnalyticsSecurityTypeDataWithSecurityData[] | undefined
) => {
  const securities = securityTypes?.reduce((prev, currSecurityTypeData) => {
    if (currSecurityTypeData.code !== SecurityTypeCode.CURRENCY)
      prev.push(...currSecurityTypeData.securities);
    return prev;
  }, [] as AnalyticsSecurityData[]);
  const topSecurities = useMemo(() => {
    return getTopSecurities(securities);
  }, [securities]);

  const worstSecurities = useMemo(() => {
    return getWorstSecurities(securities);
  }, [securities]);

  return { topSecurities, worstSecurities };
};

const getTopSecurities = (positions: AnalyticsSecurityData[] | undefined) => {
  if (!positions?.length) return [];
  return [...positions]
    .sort(function (a, b) {
      const valueChangeA =
        (a?.firstAnalysis?.marketValue || 0) -
        (a?.firstAnalysis?.tradeAmount || 0);
      const valueChangeB =
        (b?.firstAnalysis?.marketValue || 0) -
        (b?.firstAnalysis?.tradeAmount || 0);
      return valueChangeB - valueChangeA;
    })
    .slice(0, 3);
};

const getWorstSecurities = (positions: AnalyticsSecurityData[] | undefined) => {
  if (!positions?.length) return [];
  return [...positions]
    .sort(function (a, b) {
      const valueChangeA =
        (a?.firstAnalysis?.marketValue || 0) -
        (a?.firstAnalysis?.tradeAmount || 0);
      const valueChangeB =
        (b?.firstAnalysis?.marketValue || 0) -
        (b?.firstAnalysis?.tradeAmount || 0);
      return valueChangeA - valueChangeB;
    })
    .slice(0, 3);
};
