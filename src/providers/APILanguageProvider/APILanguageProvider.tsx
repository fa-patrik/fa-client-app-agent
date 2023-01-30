import { useGetContactInfo } from "api/initial/useGetContactInfo";
import { LoadingIndicator, QueryError } from "components";
import { useFeedI18nextWithLocale } from "./useFeedI18nextWithLocale";

interface UserSettingsProviderProps {
  children: JSX.Element;
}

export const APILanguageProvider = ({
  children,
}: UserSettingsProviderProps) => {
  const { data, error } = useGetContactInfo();
  const { isReady } = useFeedI18nextWithLocale(data?.locale);

  if (error && !data) {
    return <QueryError />;
  }

  if (!isReady) {
    return (
      <div className="h-screen">
        <LoadingIndicator center />
      </div>
    );
  }

  return children;
};
