import { ErrorMessage } from "components/ErrorMessage/ErrorMessage";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useNavigate } from "react-router";

interface ErrorViewProps {
  title?: string;
  info?: string;
  navigateText?: string;
  navigateTo?: string;
}

/**
 * By default displays a "Not found" error with
 * a button to navigate back 1 step. However, all text
 * can be overridden using either a i18n path or straight up text.
 */
export const ErrorView = ({
  title,
  info,
  navigateText,
  navigateTo,
}: ErrorViewProps) => {
  const { t } = useModifiedTranslation();
  const navigate = useNavigate();
  return (
    <ErrorMessage header={t(title ?? "notFoundPage.title")}>
      {t(info ?? "notFoundPage.info")}
      <div
        onClick={() => (navigateTo ? navigate(navigateTo) : navigate(-1))}
        className="font-semibold text-primary-500 cursor-pointer"
      >
        {t(navigateText ?? "notFoundPage.navigateText")}
      </div>
    </ErrorMessage>
  );
};
