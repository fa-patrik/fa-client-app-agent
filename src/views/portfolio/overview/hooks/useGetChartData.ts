import { useMemo } from "react";
import { SecurityTypeDataWithSecurityData } from "api/overview/types";

export const useGetChartData = (
  securityTypes: SecurityTypeDataWithSecurityData[] | undefined
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
