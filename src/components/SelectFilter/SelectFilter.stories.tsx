import { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { SelectFilter, Option } from "./SelectFilter";

export default {
  title: "UX/SelectFilter",
  component: SelectFilter,
} as ComponentMeta<typeof SelectFilter>;

const Template: ComponentStory<typeof SelectFilter> = (args) => {
  const [selected, setSelected] = useState<Option[]>([]);

  return <SelectFilter {...args} value={selected} onChange={setSelected} />;
};

const options: Option[] = [
  { label: "Alice", id: 1 },
  { label: "Bob", id: 2 },
  { label: "Caitlin", id: 3 },
  { label: "David", id: 4 },
  { label: "Eve", id: 5 },
  { label: "Frank", id: 6 },
  { label: "Grace", id: 7 },
  { label: "Heidi", id: 8 },
];

export const Example = Template.bind({});
Example.args = {
  options: options,
};
