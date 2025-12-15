import type { Meta, StoryObj } from "@storybook/react-vite";
import Alert, { Severity } from "./Alert";

const meta = {
  title: "UX/Alert",
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    id: "info-alert",
    severity: Severity.Info,
    title: "Info Alert",
    content: "This is an informational message.",
  },
};

export const Success: Story = {
  args: {
    id: "success-alert",
    severity: Severity.Success,
    title: "Success Alert",
    content: "This is a success message.",
  },
};

export const Warning: Story = {
  args: {
    id: "warning-alert",
    severity: Severity.Warning,
    title: "Warning Alert",
    content: "This is a warning message.",
  },
};

export const Error: Story = {
  args: {
    id: "error-alert",
    severity: Severity.Error,
    title: "Error Alert",
    content: "This is an error message.",
  },
};

export const FullWidth: Story = {
  args: {
    id: "full-width-alert",
    severity: Severity.Info,
    title: "Full Width Alert",
    content:
      "This alert takes the full width of its container when fullWidth prop is set to true.",
    fullWidth: true,
  },
};

export const Dismissible: Story = {
  args: {
    id: "dismissible-alert",
    severity: Severity.Warning,
    title: "Dismissible Alert",
    content:
      "This alert can be dismissed by clicking the X button. It will be remembered in session storage.",
    dismissible: true,
  },
};

export const DismissibleWithCustomHandler: Story = {
  args: {
    id: "dismissible-custom-alert",
    severity: Severity.Success,
    title: "Custom Dismiss Handler",
    content:
      "This alert uses a custom onDismiss handler instead of session storage.",
    dismissible: true,
    onDismiss: () => alert("Custom dismiss handler called!"),
  },
};