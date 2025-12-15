import type { Meta, StoryObj } from "@storybook/react-vite";
import { PieChart } from "./PieChart";

const meta = {
  title: "UX/PieChart",
  component: PieChart,
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: () => (
    <div className="w-64">
      <PieChart
        series={[10, 20, 30, 40]}
        labels={["Apples", "Oranges", "Bananas", "Grapes"]}
      />
    </div>
  ),
};
