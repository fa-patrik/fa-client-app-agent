import { IconDefinition, faCoffee } from "@fortawesome/free-solid-svg-icons";
import { Story, Meta } from "@storybook/react/types-6-0";
import Icon, { Size } from "./Icon";

export default {
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
} as Meta;

const Template: Story<{
  severity: string;
  icon: IconDefinition;
  size?: Size;
}> = (args) => <Icon {...args} />;

export const Small = Template.bind({});
Small.args = {
  severity: "Info",
  icon: faCoffee,
  size: "small",
};

export const Medium = Template.bind({});
Medium.args = {
  severity: "Success",
  icon: faCoffee,
  size: "medium",
};

export const Large = Template.bind({});
Large.args = {
  severity: "Error",
  icon: faCoffee,
  size: "large",
};
