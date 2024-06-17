import { Story, Meta } from "@storybook/react/types-6-0";
import { Severity } from "components/Alert/Alert";
import Banner, { BannerProps } from "./Banner";

export default {
  title: "UX/Banner",
  component: Banner,
} as Meta;

const Template: Story<BannerProps> = (args) => <Banner {...args} />;

export const Info = Template.bind({});
Info.args = {
  id: "info",
  severity: Severity.Info,
  title: "Information",
  description: "This is an informational banner.",
  dismissable: true,
};

export const Success = Template.bind({});
Success.args = {
  id: "success",
  severity: Severity.Success,
  title: "Success",
  description: "This is a success banner.",
  dismissable: true,
};

export const Error = Template.bind({});
Error.args = {
  id: "error",
  severity: Severity.Error,
  title: "Error",
  description: "This is an error banner.",
  dismissable: true,
};

export const WarningNoDescription = Template.bind({});
WarningNoDescription.args = {
  id: "warning",
  severity: Severity.Warning,
  title: "This only has a title",
  dismissable: true,
};

export const WarningNoTitle = Template.bind({});
WarningNoTitle.args = {
  id: "warning",
  severity: Severity.Warning,
  description: "This only has a description.",
  dismissable: true,
};

export const WarningNotDismissable = Template.bind({});
WarningNotDismissable.args = {
  id: "warning",
  severity: Severity.Warning,
  title: "Warning",
  description: "This is not dismissable.",
  dismissable: false,
};
