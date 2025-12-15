import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Toggle from "./Toggle";

const meta = {
  title: "UX/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    enabled: {
      control: false,
      description:
        "Whether the toggle is enabled/checked (controlled by state in stories)",
    },
    setEnabled: {
      control: false,
      description: "State setter function for the enabled state",
    },
    label: {
      control: "text",
      description: "Optional label text displayed next to the toggle",
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    enabled: false,
    setEnabled: () => {},
  },
  render: (args) => {
    const [enabled, setEnabled] = useState(false);
    return <Toggle {...args} enabled={enabled} setEnabled={setEnabled} />;
  },
};

export const Enabled: Story = {
  args: {
    enabled: true,
    setEnabled: () => {},
  },
  render: (args) => {
    const [enabled, setEnabled] = useState(true);
    return <Toggle {...args} enabled={enabled} setEnabled={setEnabled} />;
  },
};

export const WithLabel: Story = {
  render: (args) => {
    const [enabled, setEnabled] = useState(false);
    return <Toggle {...args} enabled={enabled} setEnabled={setEnabled} />;
  },
  args: {
    label: "%",
    enabled: false,
    setEnabled: () => {},
  },
};

export const EnabledWithLabel: Story = {
  render: (args) => {
    const [enabled, setEnabled] = useState(true);
    return <Toggle {...args} enabled={enabled} setEnabled={setEnabled} />;
  },
  args: {
    label: "Enable notifications",
    enabled: true,
    setEnabled: () => {},
  },
};

export const PercentageToggle: Story = {
  render: (args) => {
    const [enabled, setEnabled] = useState(true);
    return <Toggle {...args} enabled={enabled} setEnabled={setEnabled} />;
  },
  args: {
    label: "%",
    enabled: true,
    setEnabled: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of the percentage toggle used in trading modals (Sell/Buy).",
      },
    },
  },
};
