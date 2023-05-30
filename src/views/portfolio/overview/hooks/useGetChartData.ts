import { useMemo } from "react";
import { SecurityTypeDataWithSecurityData } from "api/overview/types";

export const useGetChartData = (
  securityTypes: SecurityTypeDataWithSecurityData[]
) => {
  return useMemo(
    () => ({
      series: securityTypes.map(
        (typeData) => typeData.firstAnalysis.shareOfTotal * 100
      ),
      labels: securityTypes.map((typeData) => typeData.name),
    }),
    [securityTypes]
  );
};
