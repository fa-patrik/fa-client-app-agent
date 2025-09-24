import { action } from "@storybook/addon-actions";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { DonutChart } from "./DonutChart";

export default {
  title: "UX/DonutChart",
  component: DonutChart,
  argTypes: {
    series: {
      control: "array",
      description: "The data series to be displayed in the chart.",
    },
    labels: {
      control: "array",
      description: "The labels for each data series.",
    },
    options: {
      control: "object",
      description: "Custom ApexCharts options to override the defaults.",
    },
  },
} as ComponentMeta<typeof DonutChart>;

const Template: ComponentStory<typeof DonutChart> = (args) => (
  <div className="w-[400px] h-[400px]">
    <DonutChart {...args} />
  </div>
);

export const Example = Template.bind({});
Example.args = {
  series: [10, 20, 30, 40],
  labels: ["Apples", "Oranges", "Bananas", "Grapes"],
};

export const WithGradient = Template.bind({});
WithGradient.args = {
  ...Example.args,
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
};

export const WithCenterLabel = Template.bind({});
WithCenterLabel.args = {
  ...Example.args,
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
              formatter: function (w: { globals: { seriesTotals: number[] } }) {
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
};

export const WithEvents = Template.bind({});
WithEvents.args = {
  ...Example.args,
  series: [44, 55, 13, 43, 22],
  labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
  options: {
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          action("dataPointSelected")({
            seriesIndex: config.seriesIndex,
            dataPointIndex: config.dataPointIndex,
          });
        },
      },
    },
  },
};
