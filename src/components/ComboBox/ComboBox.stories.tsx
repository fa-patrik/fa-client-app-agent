import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Option } from "./ComboBox";
import { ComboBox } from "./ComboBox";

const meta = {
  title: "UX/ComboBox",
  component: ComboBox,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: false,
      description:
        "The currently selected option (controlled by state in stories)",
    },
    onChange: {
      control: false,
      description: "Callback function triggered when selection changes",
    },
    options: {
      control: "object",
      description: "Array of options to display in the dropdown",
    },
    label: {
      control: "text",
      description: "Label text displayed above the combobox",
    },
    disabled: {
      control: "boolean",
      description: "Whether the combobox is disabled",
    },
    loading: {
      control: "boolean",
      description: "Whether to show a loading indicator instead of the chevron",
    },
    tooltipContent: {
      control: "text",
      description:
        "Optional tooltip content that appears in a dialog when clicking the info icon",
    },
    error: {
      control: "text",
      description: "Error message to display below the combobox",
    },
    height: {
      control: "text",
      description:
        "Custom height class for the dropdown menu (defaults to responsive height based on screen size)",
    },
  },
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { id: 1, label: "Durward Reynolds" },
  { id: 2, label: "Kenton Towne" },
  { id: 3, label: "Therese Wunsch" },
  { id: 4, label: "Benedict Kessler" },
  { id: 5, label: "Katelyn Rohan" },
];

export const Example: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <ComboBox {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "Select a person",
    value: undefined,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default ComboBox with searchable dropdown. Type to filter options.",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <ComboBox {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "Disabled ComboBox",
    disabled: true,
    value: undefined,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox in disabled state. User cannot interact with the component.",
      },
    },
  },
};

export const Loading: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <ComboBox {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "Loading ComboBox",
    loading: true,
    value: undefined,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox in loading state, displaying a loading indicator. The component is disabled while loading.",
      },
    },
  },
};

export const WithError: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <ComboBox {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "ComboBox with Error",
    error: "This field is required",
    value: undefined,
    onChange: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          "ComboBox with validation error. Shows error styling and message below the component.",
      },
    },
  },
};
