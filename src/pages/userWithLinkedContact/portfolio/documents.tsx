import { useGetDocuments } from "api/documents/useGetDocuments";
import { QueryLoadingWrapper } from "components";
import { Documents } from "views/documents/documents";

export const DocumentsPage = () => {
  const queryData = useGetDocuments();
  return <QueryLoadingWrapper {...queryData} SuccessComponent={Documents} />;
};
