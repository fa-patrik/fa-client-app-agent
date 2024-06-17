import { Severity } from "components/Alert/Alert";
import { useConfig } from "providers/ConfigProvider";
import Banner from "./Banner";

function isSeverity(severity: string | undefined): severity is Severity {
  return !!severity && Object.values(Severity).includes(severity as Severity);
}

const ConfiguredBanner = () => {
  const config = useConfig();
  const title = config?.banner?.title;
  const description = config?.banner?.description;
  const dismissable = config?.banner?.dismissable;
  const severity = config?.banner?.severity;

  if (!isSeverity(severity) || (!title && !description)) {
    return null;
  }

  return (
    <Banner
      id="configured-banner"
      severity={severity}
      title={title}
      description={description}
      dismissable={dismissable}
    />
  );
};

export default ConfiguredBanner;
