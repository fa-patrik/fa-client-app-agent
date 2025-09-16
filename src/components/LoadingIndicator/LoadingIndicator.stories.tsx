import { ComponentStory, ComponentMeta } from "@storybook/react";
import { LoadingIndicator } from "./LoadingIndicator";

export default {
  title: "UX/LoadingIndicator",
  component: LoadingIndicator,
} as ComponentMeta<typeof LoadingIndicator>;

// Size comparison
export const AllSizes: ComponentStory<typeof LoadingIndicator> = () => (
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
);
