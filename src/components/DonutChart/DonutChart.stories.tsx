import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart } from "./DonutChart";

const meta = {
  title: "UX/DonutChart",
  component: DonutChart,
  argTypes: {
    series: {
      control: "object",
      description: "The data series to be displayed in the chart.",
    },
    labels: {
      control: "object",
      description: "The labels for each data series.",
    },
    options: {
      control: "object",
      description: "Custom ApexCharts options to override the defaults.",
    },
  },
  render: (args) => (
    <div className="w-[400px] h-[400px]">
      <DonutChart {...args} />
    </div>
  ),
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    series: [10, 20, 30, 40],
    labels: ["Apples", "Oranges", "Bananas", "Grapes"],
  },
};

export const WithGradient: Story = {
  args: {
    series: [25, 35, 20, 20],
    labels: ["Technology", "Healthcare", "Finance", "Energy"],
    options: {
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "radial",
          shadeIntensity: 0.15,
          gradientToColors: ["#4F46E5", "#059669", "#DC2626", "#D97706"],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100],
        },
      },
    },
  },
};

export const WithCenterLabel: Story = {
  args: {
    series: [30, 25, 20, 25],
    labels: ["Sales", "Marketing", "Development", "Support"],
    options: {
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              name: {
                formatter: function (val: string) {
                  return val;
                },
              },
              value: {
                fontWeight: 700,
                formatter: function (val: string) {
                  return val + "%";
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#374151",
                formatter: function (w: {
                  globals: { seriesTotals: number[] };
                }) {
                  const total = w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0
                  );
                  return total + "%";
                },
              },
            },
          },
        },
      },
    },
  },
};

export const WithEvents: Story = {
  args: {
    series: [44, 55, 13, 43, 22],
    labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
    options: {
      chart: {
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            console.log("dataPointSelected", {
              seriesIndex: config.seriesIndex,
              dataPointIndex: config.dataPointIndex,
            });
          },
        },
      },
    },
  },
};
