import type { Meta, StoryObj } from "@storybook/react-vite";
import { Center } from "./Center";

const meta = {
  title: "UX/Center",
  component: Center,
} satisfies Meta<typeof Center>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: (args) => (
    <div className="w-64 h-32 text-yellow-100 bg-yellow-800">
      <Center>{args.children}</Center>
    </div>
  ),
  args: {
    children: "I am in center",
  },
};
