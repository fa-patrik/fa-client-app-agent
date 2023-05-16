import { useState } from "react";
import { faker } from "@faker-js/faker";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { SelectFilter, FilterOption } from "./SelectFilter";

export default {
  title: "UX/SelectFilter",
  component: SelectFilter,
} as ComponentMeta<typeof SelectFilter>;

const Template: ComponentStory<typeof SelectFilter> = (args) => {
  const [selected, setSelected] = useState<FilterOption[]>([]);

  return <SelectFilter {...args} value={selected} onChange={setSelected} />;
};

const generateData = (count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    label: faker.finance.accountName(),
    count: faker.number.int({ min: 0, max: 100 }),
  }));

export const Example = Template.bind({});
Example.args = {
  options: generateData(14),
  label: "Select account",
};
