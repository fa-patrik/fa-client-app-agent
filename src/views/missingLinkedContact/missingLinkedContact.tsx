import type { Process } from "api/flowable/useGetContactProcesses";
import { useGetContactProcesses } from "api/flowable/useGetContactProcesses";
import { QueryLoadingWrapper } from "components";
import { Navigate } from "react-router-dom";
import { NoOnboardingProcess } from "./components/NoOnboardingProcess";

interface MissingLinkedContactProps {
  data: Process[];
}

const MissingLinkedContact = ({ data }: MissingLinkedContactProps) => {
  if (data.length !== 0) {
    const { key, name } = data[0];
    /** Force user to an onboarding form/process */
    return <Navigate to={`/form/${key}`} state={{ header: name }} />;
  }
  return <NoOnboardingProcess />;
};

export const MissingLinkedContactGuard = () => {
  const queryData = useGetContactProcesses("ONBOARDING");

  return (
    <QueryLoadingWrapper
      {...queryData}
      SuccessComponent={MissingLinkedContact}
    />
  );
};
