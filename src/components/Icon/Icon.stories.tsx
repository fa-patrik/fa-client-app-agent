import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "UX/Icon",
  component: Icon,
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["small", "medium", "large"],
      },
    },
    severity: {
      control: {
        type: "select",
        options: ["Info", "Success", "Error", "Warning"],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    severity: "Info",
    icon: faCoffee,
    size: "small",
  },
};

export const Medium: Story = {
  args: {
    severity: "Success",
    icon: faCoffee,
    size: "medium",
  },
};

export const Large: Story = {
  args: {
    severity: "Error",
    icon: faCoffee,
    size: "large",
  },
};
