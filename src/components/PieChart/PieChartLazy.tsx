import { useMemo, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import type { ApexOptions } from "apexcharts";
import { useGetSubPortfolioIds } from "api/common/useGetSubPortfolioIds";
import { AnalyticsGroupBy } from "api/types";
import { getFetchPolicyOptions } from "api/utils";
import { QueryLoadingWrapper } from "components/QueryLoadingWrapper/QueryLoadingWrapper";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { PieChart } from "./PieChart";

const generateSeriesAndLabels = (groupData: Group[] | undefined) => {
  return {
    series: groupData
      ?.map((data) =>
        data?.firstAnalysis?.shareOfTotal !== undefined
          ? data?.firstAnalysis?.shareOfTotal * 100
          : undefined
      )
      .filter((value) => value !== undefined),
    labels: groupData?.map((data) => data.name),
  };
};

interface Group {
  code: string;
  name: string;
  firstAnalysis: {
    marketValue: number;
    tradeAmount: number;
    shareOfTotal: number;
  };
}

interface AllocationsQuery {
  analytics: {
    grouppedAnalytics: {
      portfolio: {
        id: number;
      };
      firstAnalysis: {
        marketValue: number;
        tradeAmount: number;
      };
      group: Group[];
    };
  };
}

const PERIOD_IN_DAYS = 1;
const ALLOCATIONS_QUERY = gql`
  fragment AnalyticsGroup on GrouppedAnalyticsDTO {
    group: grouppedAnalytics {
      code
      name
      firstAnalysis {
        marketValue
        tradeAmount
        shareOfTotal
      }
    }
  }
  query GetAllocations(
    $portfolioIds: [Long]
    $locale: Locale
    $startDate: String
    $endDate: String
    $groupBy: [GroupBy]
    $groupCode: String
  ) {
    analytics(
      parameters: {
        pfIds: $portfolioIds
        startDate: $startDate
        endDate: $endDate
        paramsSet: {
          key: "allocations"
          timePeriodCodes: "GIVEN"
          grouppedByProperties: $groupBy
          groupCode: $groupCode
          includeData: false
          includeChildren: true
          drilldownEnabled: false
          limit: 0
          locale: $locale
        }
        includeDrilldownPositions: false
      }
    ) {
      grouppedAnalytics(key: "allocations") {
        portfolio {
          id
        }
        firstAnalysis {
          marketValue
          tradeAmount
        }
        ...AnalyticsGroup
      }
    }
  }
`;

interface PieChartLazyProps {
  groupBy: AnalyticsGroupBy | undefined;
  groupCode: string | undefined;
  options?: ApexOptions;
  portfolioId: number | undefined;
}

interface PieProps {
  data: AllocationsQuery | undefined;
  options?: ApexOptions;
}

// Defined outside PieChartLazy to maintain stable component identity
// and prevent unnecessary remounts on parent re-renders
const Pie = ({ data, options }: PieProps) => {
  const [isReady, setIsReady] = useState(false);

  const { series: chartSeries, labels: chartLabels } = useMemo(() => {
    return generateSeriesAndLabels(data?.analytics.grouppedAnalytics.group);
  }, [data]);

  useEffect(() => {
    // Delay mounting to ensure container layout has stabilized
    // This prevents ApexCharts from calculating wrong dimensions
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <></>;
  }

  return (
    <PieChart series={chartSeries} labels={chartLabels} options={options} />
  );
};

const PieChartLazy = ({
  groupBy = AnalyticsGroupBy.TYPE,
  groupCode,
  options,
  portfolioId,
}: PieChartLazyProps) => {
  const portfolioIds = useGetSubPortfolioIds(portfolioId);
  const { i18n } = useModifiedTranslation();
  const locale =
    i18n.language === i18n.resolvedLanguage
      ? i18n.language
      : i18n.resolvedLanguage;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - PERIOD_IN_DAYS);
  const endDate = new Date();

  const { loading, error, data } = useQuery<AllocationsQuery>(
    ALLOCATIONS_QUERY,
    {
      variables: {
        portfolioIds,
        locale: locale,
        startDate: startDate.toLocaleDateString("sv-SE"),
        endDate: endDate.toLocaleDateString("sv-SE"),
        groupCode: groupCode,
        groupBy: [groupBy],
      },
      ...getFetchPolicyOptions(`GetAllocations.${portfolioIds}`),
    }
  );

  return (
    <QueryLoadingWrapper
      data={data}
      loading={loading}
      error={error}
      SuccessComponent={Pie}
      successComponentProps={{ options }}
    />
  );
};

export default PieChartLazy;
