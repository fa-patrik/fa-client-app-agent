import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "UX/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Default Input",
    placeholder: "Enter text here...",
    id: "default-input",
  },
};

export const WithError: Story = {
  args: {
    label: "Input with Error",
    placeholder: "Enter valid data...",
    error: "This field is required",
    id: "error-input",
  },
};

export const WithTooltip: Story = {
  args: {
    label: "Input with Tooltip",
    placeholder: "Hover the info icon...",
    tooltipContent: "This is helpful information about this field.",
    id: "tooltip-input",
  },
};

export const WithEndAdornment: Story = {
  args: {
    label: "Amount Input",
    placeholder: "0.00",
    type: "number",
    id: "amount-input",
    endAdornment: (
      <button
        type="button"
        className="py-1 px-2 text-xs font-bold text-primary-600 hover:bg-gray-100 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
        onClick={() => alert("MAX button clicked!")}
      >
        MAX
      </button>
    ),
  },
};

export const WithCurrencySymbol: Story = {
  args: {
    label: "Price",
    placeholder: "0.00",
    type: "number",
    id: "price-input",
    endAdornment: <span className="text-sm font-medium text-gray-500">USD</span>,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "Cannot edit this...",
    disabled: true,
    id: "disabled-input",
  },
};

export const Checkbox: Story = {
  args: {
    label: "Checkbox Input",
    type: "checkbox",
    id: "checkbox-input",
  },
};

