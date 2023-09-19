import { useMutation, gql } from "@apollo/client";

const COMPLETE_TASK = gql`
  mutation ($taskId: String, $processInstanceId: String, $data: String) {
    completeTask(
      taskId: $taskId
      processInstanceId: $processInstanceId
      data: $data
    ) {
      formDefinition
      taskId
      processInstanceId
      data
    }
  }
`;

export interface TaskResponse {
  formDefinition: string | undefined;
  taskId: string;
  processInstanceId: string;
  data?: {
    attachments?: Record<string, string>;
  };
}

export const useCompleteTask = () => {
  const [completeTask, { data, loading, error, reset }] = useMutation<{
    completeTask: TaskResponse;
  }>(COMPLETE_TASK);

  return {
    loading,
    error,
    reset,
    data,
    completeTask,
  };
};
