import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface PieChartProps {
  series?: number[];
  labels?: Array<string>;
  options?: ApexOptions;
}

const pieChartDefaultOptions = {
  colors: ["#16BDCA", "#FDBA8C", "#1A56DB", "#D61F69", "#9061F9", "#6875F5"],
  chart: {
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: false,
    },
  },
  stroke: {
    colors: ["#ffffff"],
  },
  plotOptions: {
    pie: {
      donut: {
        size: "5%",
      },
    },
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 0.9,
      },
    },
  },
  tooltip: {
    shared: true,
    followCursor: false,
    fillSeriesColor: false,
    inverseOrder: true,
    style: {
      fontSize: "14px",
      fontFamily: "Inter, sans-serif",
    },
    y: {
      formatter: function (value: number) {
        return value.toFixed(2) + "%";
      },
    },
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: true,
    position: "bottom" as const,
  },
};

export const PieChart = ({ series, labels, options }: PieChartProps) => (
  <Chart
    options={{ labels, ...pieChartDefaultOptions, ...options }}
    series={series}
    type="pie"
    height="105%"
  />
);
