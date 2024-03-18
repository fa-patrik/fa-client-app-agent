import { useMemo } from "react";
import { AnalyticsSecurityTypeDataWithSecurityData } from "api/holdings/types";

export const useGetChartData = (
  securityTypes: AnalyticsSecurityTypeDataWithSecurityData[] | undefined
) => {
  return useMemo(() => {
    if (!securityTypes?.length) return { series: [], labels: [] };
    return {
      series: securityTypes.map((typeData) =>
        typeData?.firstAnalysis?.shareOfTotal !== undefined
          ? typeData?.firstAnalysis?.shareOfTotal * 100
          : undefined
      ),
      labels: securityTypes.map((typeData) => typeData.name),
    };
  }, [securityTypes]);
};
