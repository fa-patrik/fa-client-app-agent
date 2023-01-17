import { useEffect, useCallback, Dispatch, useReducer } from "react";
import { TaskResponse, useCompleteTask } from "api/flowable/useCompleteTask";
import {
  StartProcessTaskResponse,
  useStartProcess,
} from "api/flowable/useStartProcess";
import { useKeycloak } from "providers/KeycloakProvider";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";

type FormDefinition = Record<string, unknown>;

export interface Attachment {
  url: string;
  name: string;
}

type ProcessStateType =
  | {
    formDefinition: FormDefinition | undefined;
    initialData: Record<string, unknown>;
    attachments: Attachment[];
    taskId: string;
    processInstanceId: string;
    executorState: "READY" | "SUBMITTING" | "SUBMIT_ERROR";
  }
  | {
    executorState: "LOADING" | "PROCESS_ERROR";
  };

type StateActionType =
  | { type: "UPDATE_DATA"; payload: Partial<ProcessStateType> }
  | { type: "SET_DATA"; payload: ProcessStateType }
  | { type: "RESET_SUBMIT_ERROR" };

const processInitialState = {
  executorState: "LOADING" as const,
};

const processStateReducer = (
  state: ProcessStateType,
  action: StateActionType
): ProcessStateType => {
  switch (action.type) {
    case "UPDATE_DATA": {
      const payload: Partial<ProcessStateType> = action.payload;
      const newExecutorState = payload.executorState ?? state.executorState;
      if (
        newExecutorState === "READY" ||
        newExecutorState === "SUBMITTING" ||
        newExecutorState === "SUBMIT_ERROR"
      ) {
        return { ...state, ...payload } as ProcessStateType;
      }
      return { executorState: newExecutorState };
    }
    case "SET_DATA":
      return action.payload;
    case "RESET_SUBMIT_ERROR":
      if (
        state.executorState === "READY" ||
        state.executorState === "SUBMITTING" ||
        state.executorState === "SUBMIT_ERROR"
      ) {
        return { ...state, executorState: "READY" as const };
      }
      return state;
    default:
      throw new Error();
  }
};

const attachmentsObjectToList = (
  attachments: Record<string, Attachment> | undefined
) => (attachments ? Object.values(attachments) : []);

export const useProcessExecutor = () => {
  const { userProfile } = useKeycloak();
  const navigate = useNavigate();
  const [processState, dispatchProcessStateAction] = useReducer(
    processStateReducer,
    processInitialState
  );

  useInitializeForm(dispatchProcessStateAction);

  const { completeTask } = useCompleteTask();

  const submitData =
    processState.executorState === "READY" &&
    (async (submissionData: { data: Record<string, unknown> }) => {
      dispatchProcessStateAction({
        type: "UPDATE_DATA",
        payload: {
          executorState: "SUBMITTING",
        },
      });

      try {
        const completeTaskResponse = await completeTask({
          variables: {
            data: JSON.stringify(submissionData.data),
            taskId: processState.taskId,
            processInstanceId: processState.processInstanceId,
          },
        });
        const { processFinished } = finishCurrentTask(
          completeTaskResponse.data?.completeTask,
          dispatchProcessStateAction
        );

        if (processFinished) {
          navigate("/");
          window.location.reload() //reloads keycloak
        }
      } catch (error) {
        dispatchProcessStateAction({
          type: "UPDATE_DATA",
          payload: {
            executorState: "SUBMIT_ERROR",
          },
        });
      }
    });

  if (
    processState.executorState === "READY" ||
    processState.executorState === "SUBMITTING"
  ) {
    return {
      executorState: processState.executorState,
      formDefinition: processState.formDefinition,
      initialData: {
        ...userProfile,
        ...processState.initialData,
      },
      attachments: processState.attachments,
      taskId: processState.taskId,
      submitData,
    };
  }

  if (processState.executorState === "SUBMIT_ERROR") {
    return {
      executorState: processState.executorState,
      resetApiError: () =>
        dispatchProcessStateAction({ type: "RESET_SUBMIT_ERROR" }),
    };
  }

  return {
    executorState: processState.executorState,
  };
};

const useInitializeForm = (
  dispatchProcessStateAction: Dispatch<StateActionType>
) => {
  const { formKey } = useParams();
  const { startProcess } = useStartProcess(formKey);

  const initForm = useCallback(
    (initFormData: StartProcessTaskResponse | undefined) => {
      if (
        !initFormData ||
        (initFormData && !initFormData.processInstanceId) ||
        !initFormData.formDefinition
      ) {
        dispatchProcessStateAction({
          type: "SET_DATA",
          payload: {
            executorState: "PROCESS_ERROR",
          },
        });
        return;
      }

      dispatchProcessStateAction({
        type: "UPDATE_DATA",
        payload: {
          formDefinition: JSON.parse(
            initFormData.formDefinition
          ) as FormDefinition,
          initialData: initFormData.data || {},
          attachments: attachmentsObjectToList(initFormData.data?.attachments),
          taskId: initFormData.taskId,
          processInstanceId: initFormData.processInstanceId,
          executorState: "READY",
        },
      });
    },
    [dispatchProcessStateAction]
  );

  useEffect(() => {
    let hookRunning = true;
    const initializeForm = async () => {
      const responseData = (await startProcess()).data?.startProcess;
      if (hookRunning) {
        initForm(responseData);
      }
    };
    initializeForm();
    return () => {
      hookRunning = false;
    };
  }, [startProcess, initForm]);
};

const finishCurrentTask = (
  nextTask: TaskResponse | undefined,
  dispatchProcessStateAction: Dispatch<StateActionType>
) => {
  // process not ended we have next task
  if (nextTask?.processInstanceId) {
    const formDefinition = JSON.parse(nextTask.formDefinition || "");

    dispatchProcessStateAction({
      type: "UPDATE_DATA",
      payload: {
        formDefinition,
        initialData: nextTask.data || {},
        attachments: attachmentsObjectToList(nextTask.data?.attachments),
        taskId: nextTask.taskId,
        processInstanceId: nextTask.processInstanceId,
        executorState: "READY",
      },
    });
  }

  return {
    processFinished: !nextTask?.formDefinition,
  };
};
