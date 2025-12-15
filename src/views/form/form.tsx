import { Form } from "@formio/react";
import { LoadingIndicator } from "components";
import { useDetailsHeader } from "layouts/DetailsLayout/DetailsHeaderContext";
import { useLocation } from "react-router-dom";
import { ApiError } from "./components/ApiError";
import { Attachments } from "./components/Attachments";
import { FormNotFound } from "./components/FormNotFound";
import { ProcessNotFound } from "./components/ProcessNotFound";
import { useFormioStyles } from "./useFormioStyles";
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
  initialData: propsInitialData = {},
}: FormViewProps) => {
  const processState = useProcessExecutor();
  const { state: locationState } = useLocation() as unknown as LocationProps;
  useDetailsHeader(locationState?.header ?? "");

  /**
   * IMPORTANT
   * Apply Formio (Bootstrap) styles
   * This is required to make the form look correct
   * as Formio uses Bootstrap for styling
   * However, this also affects the styling overall
   * which is why we hide certain elements in the DetailsLayout
   * when rendering the FormView
   */
  useFormioStyles();

  return (
    <>
      {processState.executorState === "READY" &&
        processState.formDefinition && (
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
