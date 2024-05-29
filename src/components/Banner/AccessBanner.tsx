import { useGetContactInfo } from "api/common/useGetContactInfo";
import { Severity, getIconBySeverity } from "components/Alert/Alert";
import { Badge } from "components/Badge/Badge";
import Icon from "components/Icon/Icon";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import Banner from "./Banner";

const AccessBadge = ({
  access,
  children,
}: {
  access: boolean;
  children: React.ReactNode;
}) => {
  const severity = access ? Severity.Success : Severity.Error;
  return (
    <Badge severity={severity}>
      <div className="flex flex-row gap-1 items-center">
        {children}
        <Icon
          severity={severity}
          icon={getIconBySeverity(severity)}
          size="large"
        />
      </div>
    </Badge>
  );
};

export const AccessBanner = () => {
  const { linkedContact } = useKeycloak();
  const { t } = useModifiedTranslation();
  const { data: linkedContactData } = useGetContactInfo(false, linkedContact);
  const { access } = useKeycloak();
  const showBanner = access.impersonate;

  if (!showBanner) return null;

  return (
    <Banner
      id="access-mode-banner"
      severity={Severity.Info}
      title={t("component.accessBanner.title", {
        contactName: linkedContactData?.name,
      })}
      content={
        <div className="flex flex-row flex-wrap gap-1 items-end">
          <p className="text-xs font-semibold">
            {t("component.accessBanner.subtitle")}
          </p>
          <AccessBadge access={access.buy}>
            <p className="text-xs">{t("utils.access.buy")}</p>
          </AccessBadge>
          <AccessBadge access={access.sell}>
            <p className="text-xs">{t("utils.access.sell")}</p>
          </AccessBadge>
          <AccessBadge access={access.switch}>
            <p className="text-xs">{t("utils.access.switch")}</p>
          </AccessBadge>
          <AccessBadge access={access.deposit}>
            <p className="text-xs">{t("utils.access.deposit")}</p>
          </AccessBadge>
          <AccessBadge access={access.withdraw}>
            <p className="text-xs">{t("utils.access.withdraw")}</p>
          </AccessBadge>
          <AccessBadge access={access.impersonate}>
            <p className="text-xs">{t("utils.access.impersonate")}</p>
          </AccessBadge>
          <AccessBadge access={access.cancelOrder}>
            <p className="text-xs">{t("utils.access.cancelOrder")}</p>
          </AccessBadge>
          <AccessBadge access={access.advisor}>
            <p className="text-xs">{t("utils.access.advisor")}</p>
          </AccessBadge>
        </div>
      }
    />
  );
};
