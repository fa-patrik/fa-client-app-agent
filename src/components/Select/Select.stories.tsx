import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Option } from "./Select";
import { Select } from "./Select";

const meta = {
  title: "UX/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: false,
      description:
        "The currently selected option(s). Can be a single Option or an array of Options when selectMultiple is enabled",
    },
    onChange: {
      control: false,
      description:
        "Callback function triggered when a single option is selected (used when selectMultiple is false)",
    },
    onChangeMultiple: {
      control: false,
      description:
        "Callback function triggered when multiple options are selected (used when selectMultiple is true)",
    },
    options: {
      control: "object",
      description: "Array of options to display in the dropdown",
    },
    label: {
      control: "text",
      description: "Label text displayed above the select",
    },
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    selectMultiple: {
      control: "object",
      description:
        "Enable multi-select mode. Can be a boolean or an object with listSelectedOptions property to show selected items in the button",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options: Option[] = [
  { label: "Alice", id: 1 },
  { label: "Bob", id: 2 },
  { label: "Caitlin", id: 3 },
];

export const Example: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <Select {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "Select a person",
    value: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: "Default Select with dropdown options.",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <Select {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options,
    label: "Disabled Select",
    disabled: true,
    value: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Select in disabled state. User cannot interact with the component.",
      },
    },
  },
};

export const EmptyOptions: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option>();

    return <Select {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    options: [],
    label: "No options available",
    value: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Select with no options. The component is automatically disabled when options array is empty.",
      },
    },
  },
};

export const MultiSelect: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option[]>([]);

    return <Select {...args} value={selected} onChangeMultiple={setSelected} />;
  },
  args: {
    options,
    label: "Select multiple people",
    selectMultiple: true,
    value: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-select mode where users can select multiple options. Shows count of selected items in the button.",
      },
    },
  },
};

export const MultiSelectWithList: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Option[]>([]);

    return <Select {...args} value={selected} onChangeMultiple={setSelected} />;
  },
  args: {
    options,
    label: "Select multiple people",
    selectMultiple: {
      listSelectedOptions: true,
    },
    value: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-select mode with listSelectedOptions enabled. Shows the actual selected option labels in the button (truncated if needed).",
      },
    },
  },
};
