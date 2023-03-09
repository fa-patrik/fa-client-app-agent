import { useGetContactInfo } from "api/initial/useGetContactInfo";
import classNames from "classnames";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useKeycloak } from "providers/KeycloakProvider";
import { Tooltip } from "react-tooltip";

/**
 * A banner that displays "Viewing as:" + linked contact name
 * and a tooltip that says "You are in view-only mode".
 */
export const ImpersonationBanner = () => {
  const { linkedContact } = useKeycloak();
  const { data: linkedContactData } = useGetContactInfo(false, linkedContact);
  const { t } = useModifiedTranslation();
  const QuestionmarkIcon = () => {
    return (
      <svg
        className="stroke-gray-700 "
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.228 7C6.777 5.835 8.258 5 10 5C12.21 5 14 6.343 14 8C14 9.4 12.722 10.575 10.994 10.907C10.452 11.011 10 11.447 10 12M10 15H10.01M19 10C19 11.1819 18.7672 12.3522 18.3149 13.4442C17.8626 14.5361 17.1997 15.5282 16.364 16.364C15.5282 17.1997 14.5361 17.8626 13.4442 18.3149C12.3522 18.7672 11.1819 19 10 19C8.8181 19 7.64778 18.7672 6.55585 18.3149C5.46392 17.8626 4.47177 17.1997 3.63604 16.364C2.80031 15.5282 2.13738 14.5361 1.68508 13.4442C1.23279 12.3522 1 11.1819 1 10C1 7.61305 1.94821 5.32387 3.63604 3.63604C5.32387 1.94821 7.61305 1 10 1C12.3869 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };
  return (
    <div
      id="impersonationBanner"
      className={classNames(
        "flex gap-x-2 justify-center items-center px-2 h-12 bg-gray-200 select-none",
        {
          "animate-pulse": !linkedContactData,
        }
      )}
    >
      {linkedContactData?.name && (
        <>
          <span
            className="font-normal text-black"
            id="impersonationBannerTextContent"
          >
            {t("banners.impersonation.viewingAs")}
            {linkedContactData?.name}
          </span>

          <div
            className="transition-transform hover:scale-110 cursor-help "
            data-tooltip-id="impersonationBannerTooltip"
            data-tooltip-content={t("banners.impersonation.viewOnly")}
          >
            <QuestionmarkIcon />
          </div>
          <Tooltip place="right" id="impersonationBannerTooltip" />
        </>
      )}
    </div>
  );
};
