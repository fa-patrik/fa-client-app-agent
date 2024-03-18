import { Story, Meta } from "@storybook/react";
import Alert, { AlertProps } from "./Alert";
export default {
  title: "UX/Alert",
  component: Alert,
} as Meta;

const Template: Story<AlertProps> = (args) => <Alert {...args} />;

export const Info = Template.bind({});
Info.args = {
  id: "info-alert",
  severity: "Info",
  title: "Info Alert",
  content: "This is an informational message.",
};

export const Success = Template.bind({});
Success.args = {
  id: "success-alert",
  severity: "Success",
  title: "Success Alert",
  content: "This is a success message.",
};

export const Warning = Template.bind({});
Warning.args = {
  id: "warning-alert",
  severity: "Warning",
  title: "Warning Alert",
  content: "This is a warning message.",
};

export const Error = Template.bind({});
Error.args = {
  id: "error-alert",
  severity: "Error",
  title: "Error Alert",
  content: "This is an error message.",
};
