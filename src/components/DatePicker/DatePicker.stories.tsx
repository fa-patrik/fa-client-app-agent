import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "UX/DatePicker",
  component: DatePicker,
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date>();
    return (
      <div className="bg-white w-fit">
        <DatePicker
          {...args}
          value={value}
          onChange={(newValue) => {
            if (newValue instanceof Date) {
              setValue(newValue);
            } else {
              setValue(undefined);
            }
          }}
        />
      </div>
    );
  },
};
