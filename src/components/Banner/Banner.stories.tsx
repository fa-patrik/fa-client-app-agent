import type { Meta, StoryObj } from "@storybook/react-vite";
import { Severity } from "components/Alert/Alert";
import Banner from "./Banner";

const meta = {
  title: "UX/Banner",
  component: Banner,
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    id: "info",
    severity: Severity.Info,
    title: "Information",
    description: "This is an informational banner.",
    dismissable: true,
  },
};

export const Success: Story = {
  args: {
    id: "success",
    severity: Severity.Success,
    title: "Success",
    description: "This is a success banner.",
    dismissable: true,
  },
};

export const Error: Story = {
  args: {
    id: "error",
    severity: Severity.Error,
    title: "Error",
    description: "This is an error banner.",
    dismissable: true,
  },
};

export const WarningNoDescription: Story = {
  args: {
    id: "warning",
    severity: Severity.Warning,
    title: "This only has a title",
    dismissable: true,
  },
};

export const WarningNoTitle: Story = {
  args: {
    id: "warning",
    severity: Severity.Warning,
    description: "This only has a description.",
    dismissable: true,
  },
};

export const WarningNotDismissable: Story = {
  args: {
    id: "warning",
    severity: Severity.Warning,
    title: "Warning",
    description: "This is not dismissable.",
    dismissable: false,
  },
};
