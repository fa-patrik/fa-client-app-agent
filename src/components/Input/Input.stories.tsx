import { Story, Meta } from "@storybook/react";
import { Input, InputProps } from "./Input";

export default {
  title: "UX/Input",
  component: Input,
} as Meta;

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Default Input",
  placeholder: "Enter text here...",
  id: "default-input",
};

export const WithError = Template.bind({});
WithError.args = {
  label: "Input with Error",
  placeholder: "Enter valid data...",
  error: "This field is required",
  id: "error-input",
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  label: "Input with Tooltip",
  placeholder: "Hover the info icon...",
  tooltipContent: "This is helpful information about this field.",
  id: "tooltip-input",
};

export const WithEndAdornment = Template.bind({});
WithEndAdornment.args = {
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
};

export const WithCurrencySymbol = Template.bind({});
WithCurrencySymbol.args = {
  label: "Price",
  placeholder: "0.00",
  type: "number",
  id: "price-input",
  endAdornment: (
    <span className="text-sm font-medium text-gray-500">USD</span>
  ),
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: "Disabled Input",
  placeholder: "Cannot edit this...",
  disabled: true,
  id: "disabled-input",
};

export const Checkbox = Template.bind({});
Checkbox.args = {
  label: "Checkbox Input",
  type: "checkbox",
  id: "checkbox-input",
};

