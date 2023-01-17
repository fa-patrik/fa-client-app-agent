import { Form } from "@formio/react";
import { LoadingIndicator, Logo, UserMenu } from "components";
import "./styles.css";
import { useKeycloak } from "providers/KeycloakProvider";
import { useLocation } from "react-router-dom";
import { ApiError } from "./components/ApiError";
import { Attachments } from "./components/Attachments";
import { FormNotFound } from "./components/FormNotFound";
import { ProcessNotFound } from "./components/ProcessNotFound";
import { useProcessExecutor } from "./useProcessExecutor";


interface FormViewProps {
  header?: string;
  initialData?: Record<string, unknown>;
}

interface LocationProps {
  state: FormViewProps & {
    from: Location;
  };
}

export const FormView = ({
  header,
  initialData: propsInitialData = {},
}: FormViewProps) => {
  const processState = useProcessExecutor();

  const { state: locationState } = useLocation() as unknown as LocationProps;
  const { linkedContact } = useKeycloak();

  return (
    <>
      {processState.executorState === "READY" && processState.formDefinition && (
        <div className="flex overflow-hidden flex-col h-full">
          <div className="pt-2 bg-white border-b border-gray-200 shadow-md">
            <div className="md:container flex gap-2 items-center p-2 md:mx-auto text-2xl font-bold">
              <div className="mr-2">
                <Logo />
              </div>
              <div className="grow">{header || locationState?.header}</div>
              <div className="px-2">
                {linkedContact && <UserMenu />}
              </div>
            </div>
          </div>
          <div className="overflow-y-auto grow-1">
            <div className="container py-3 mx-auto h-full">
              <div className="grid grid-cols-1 gap-4 px-2">
                {processState.attachments.length > 0 && (
                  <Attachments attachments={processState.attachments} />
                )}
                <div className="formio-form">
                  <Form
                    key={processState.taskId}
                    form={processState.formDefinition}
                    onSubmit={processState.submitData}
                    submission={{
                      data: {
                        ...locationState?.initialData,
                        ...propsInitialData,
                        ...processState.initialData,
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {processState.executorState === "READY" &&
        !processState.formDefinition && <FormNotFound />}
      {processState.executorState === "LOADING" && (
        <div className="h-screen">
          <LoadingIndicator center />
        </div>
      )}
      {processState.executorState === "SUBMITTING" && (
        <div className="h-screen">
          <LoadingIndicator center />
        </div>
      )}
      {processState.executorState === "SUBMIT_ERROR" && (
        <ApiError resetApiError={processState.resetApiError} />
      )}
      {processState.executorState === "PROCESS_ERROR" && <ProcessNotFound />}
    </>
  );
};
