import { HTMLAttributes } from "react";
import { DownloadableDocument } from "components";

interface DocumentRowProps extends HTMLAttributes<HTMLAnchorElement> {
  label: string;
  url?: string;
  documentIdentifier?: string;
}

export const DocumentRow = (props: DocumentRowProps) => (
  <DownloadableDocument className="pt-3 pb-2" {...props} />
);
