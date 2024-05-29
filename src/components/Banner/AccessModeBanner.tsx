import { useGetContactInfo } from "api/common/useGetContactInfo";
import { Severity, getIconBySeverity } from "components/Alert/Alert";
import { Badge } from "components/Badge/Badge";
import Icon from "components/Icon/Icon";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { useRolePermissions } from "services/permissions/useRolePermissions";
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

export const AccessModeBanner = () => {
  const { linkedContact } = useKeycloak();
  const { t } = useModifiedTranslation();
  const { data: linkedContactData } = useGetContactInfo(false, linkedContact);
  const { isImpersonator, canTrade, canSave } = useRolePermissions();
  const { accessMode } = useKeycloak();
  const showBanner = isImpersonator;

  if (!showBanner) return null;

  return (
    <Banner
      id="access-mode-banner"
      severity={Severity.Info}
      title={t("component.accessModeBanner.title", {
        userType: t(`utils.accessMode.${accessMode}`),
        contactName: linkedContactData?.name,
      })}
      content={
        <div className="flex flex-row gap-1">
          <AccessBadge access={canTrade}>
            <p className="text-xs">Trade</p>
          </AccessBadge>
          <AccessBadge access={canSave}>
            <p className="text-xs">Deposit & withdraw</p>
          </AccessBadge>
        </div>
      }
    />
  );
};
