import type { Meta, StoryObj } from "@storybook/react-vite";
import { LineChart } from "./LineChart";

const meta = {
  title: "UX/LineChart",
  component: LineChart,
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const marketData = [
  {
    price: 7360,
    date: "2010-01-05",
  },
  {
    price: 7440,
    date: "2010-01-06",
  },
  {
    price: 7680,
    date: "2010-01-07",
  },
  {
    price: 7904,
    date: "2010-01-08",
  },
  {
    price: 8004,
    date: "2010-01-11",
  },
  {
    price: 8028,
    date: "2010-01-12",
  },
  {
    price: 7970,
    date: "2010-01-13",
  },
  {
    price: 8140,
    date: "2010-01-14",
  },
  {
    price: 8254,
    date: "2010-01-15",
  },
  {
    price: 8330,
    date: "2010-01-18",
  },
  {
    price: 8360,
    date: "2010-01-19",
  },
  {
    price: 8260,
    date: "2010-01-20",
  },
  {
    price: 8154,
    date: "2010-01-21",
  },
  {
    price: 8100,
    date: "2010-01-22",
  },
  {
    price: 8156,
    date: "2010-01-25",
  },
  {
    price: 7990,
    date: "2010-01-26",
  },
  {
    price: 7830,
    date: "2010-01-27",
  },
  {
    price: 7960,
    date: "2010-01-28",
  },
  {
    price: 8156,
    date: "2010-01-29",
  },
  {
    price: 8274,
    date: "2010-02-01",
  },
  {
    price: 8364,
    date: "2010-02-02",
  },
  {
    price: 8382,
    date: "2010-02-03",
  },
  {
    price: 8180,
    date: "2010-02-04",
  },
  {
    price: 8072,
    date: "2010-02-05",
  },
  {
    price: 7858,
    date: "2010-02-08",
  },
  {
    price: 7932,
    date: "2010-02-09",
  },
  {
    price: 7984,
    date: "2010-02-10",
  },
  {
    price: 8028,
    date: "2010-02-11",
  },
  {
    price: 8066,
    date: "2010-02-12",
  },
];

export const Example: Story = {
  args: {
    series: [
      {
        name: "Price",
        data: marketData.map((data) => ({
          x: data.date,
          y: data.price,
        })),
      },
    ],
  },
  render: (args) => (
    <div className="w-64">
      <LineChart {...args} />
    </div>
  ),
};
