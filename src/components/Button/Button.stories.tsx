import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { ReactComponent as DownloadIcon } from "../../assets/download.svg";

const meta = {
  title: "UX/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Primary",
    onClick: () => alert("Button clicked"),
  },
};

export const Dark: Story = {
  args: {
    children: "Dark",
    variant: "Dark",
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full width",
    isFullWidth: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: "Left Icon",
    LeftIcon: DownloadIcon,
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "Secondary",
  },
};

export const Delete: Story = {
  args: {
    children: "Delete",
    variant: "Delete",
  },
};

export const Red: Story = {
  args: {
    children: "Red",
    variant: "Red",
  },
};

export const Outlined: Story = {
  args: {
    children: "Outlined",
    variant: "Outlined",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    variant: "Success",
  },
};

export const DisabledPrimary: Story = {
  args: {
    children: "Disabled Primary",
    disabled: true,
  },
};

export const DisabledSecondary: Story = {
  args: {
    children: "Disabled Secondary",
    variant: "Secondary",
    disabled: true,
  },
};

export const DisabledDelete: Story = {
  args: {
    children: "Disabled Delete",
    variant: "Delete",
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    children: "Loading",
    isLoading: true,
  },
};

export const LoadingSecondary: Story = {
  args: {
    children: "Loading",
    variant: "Secondary",
    isLoading: true,
  },
};
