import { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ComboBox, Option } from "./ComboBox";

export default {
  title: "UX/ComboBox",
  component: ComboBox,
} as ComponentMeta<typeof ComboBox>;

const Template: ComponentStory<typeof ComboBox> = (args) => {
  const [selected, setSelected] = useState<Option>();

  return <ComboBox {...args} value={selected} onChange={setSelected} />;
};

const options = [
  { id: 1, label: 'Durward Reynolds' },
  { id: 2, label: 'Kenton Towne' },
  { id: 3, label: 'Therese Wunsch' },
  { id: 4, label: 'Benedict Kessler' },
  { id: 5, label: 'Katelyn Rohan' },
]

export const Example = Template.bind({});
Example.args = {
  options: options,
};
