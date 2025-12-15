import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingIndicator } from "./LoadingIndicator";

const meta = {
  title: "UX/LoadingIndicator",
  component: LoadingIndicator,
} satisfies Meta<typeof LoadingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-8 items-end p-4">
      <div className="text-center">
        <LoadingIndicator size="xs" />
        <p className="mt-2 text-xs text-gray-600">XS (16px)</p>
      </div>
      <div className="text-center">
        <LoadingIndicator size="sm" />
        <p className="mt-2 text-xs text-gray-600">SM (32px)</p>
      </div>
      <div className="text-center">
        <LoadingIndicator size="md" />
        <p className="mt-2 text-xs text-gray-600">MD (48px)</p>
      </div>
      <div className="text-center">
        <LoadingIndicator />
        <p className="mt-2 text-xs text-gray-600">Default (64px)</p>
      </div>
    </div>
  ),
};
