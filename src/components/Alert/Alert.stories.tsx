import { Story, Meta } from "@storybook/react";
import Alert, { AlertProps, Severity } from "./Alert";
export default {
  title: "UX/Alert",
  component: Alert,
} as Meta;

const Template: Story<AlertProps> = (args) => <Alert {...args} />;

export const Info = Template.bind({});
Info.args = {
  id: "info-alert",
  severity: Severity.Info,
  title: "Info Alert",
  content: "This is an informational message.",
};

export const Success = Template.bind({});
Success.args = {
  id: "success-alert",
  severity: Severity.Success,
  title: "Success Alert",
  content: "This is a success message.",
};

export const Warning = Template.bind({});
Warning.args = {
  id: "warning-alert",
  severity: Severity.Warning,
  title: "Warning Alert",
  content: "This is a warning message.",
};

export const Error = Template.bind({});
Error.args = {
  id: "error-alert",
  severity: Severity.Error,
  title: "Error Alert",
  content: "This is an error message.",
};

export const FullWidth = Template.bind({});
FullWidth.args = {
  id: "full-width-alert",
  severity: Severity.Info,
  title: "Full Width Alert",
  content: "This alert takes the full width of its container when fullWidth prop is set to true.",
  fullWidth: true,
};

export const Dismissible = Template.bind({});
Dismissible.args = {
  id: "dismissible-alert",
  severity: Severity.Warning,
  title: "Dismissible Alert",
  content: "This alert can be dismissed by clicking the X button. It will be remembered in session storage.",
  dismissible: true,
};

export const DismissibleWithCustomHandler = Template.bind({});
DismissibleWithCustomHandler.args = {
  id: "dismissible-custom-alert",
  severity: Severity.Success,
  title: "Custom Dismiss Handler",
  content: "This alert uses a custom onDismiss handler instead of session storage.",
  dismissible: true,
  onDismiss: () => alert("Custom dismiss handler called!"),
};