import type { ComponentProps, HTMLAttributes } from "react";
import { useMemo } from "react";
import { useDownloadDocument } from "api/documents/useDownloadDocument";
import { ReactComponent as FileIcon } from "assets/document-text.svg";
import { isValidUrl } from "utils/url";

interface DownloadableDocumentProps extends HTMLAttributes<HTMLAnchorElement> {
  label: string;
  url?: string | null;
  /**
   * When documentIdentifier is present, clicking on the link will download the document or open it in a new tab if the name ends with .link
   * When documentIdentifier is not present, clicking on the link will open the url in a new tab
   */
  documentIdentifier?: string;
  id?: string;
}

export const DownloadableDocument = ({
  label,
  url,
  documentIdentifier,
  id,
  ...anchorAttributes
}: DownloadableDocumentProps) => {
  const { downloadDocument } = useDownloadDocument();

  const isValidURL: boolean = useMemo(() => !!url && isValidUrl(url), [url]);
  // remove .link file extension from label if present
  const labelCleaned = label.endsWith(".link") ? label.slice(0, -5) : label;

  const linkAttributes: ComponentProps<"a"> = !documentIdentifier
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        href: url || undefined,
      }
    : {
        href: "#",
        onClick: (e) => {
          e.preventDefault();
          downloadDocument(documentIdentifier, "base64");
        },
      };

  return isValidURL || documentIdentifier ? (
    <a {...linkAttributes} {...anchorAttributes} id={id}>
      <div className="flex justify-between text-primary-600 stroke-primary-600">
        <div className="text-base font-semibold">{labelCleaned}</div>
        <FileIcon className="w-6 h-6" />
      </div>
    </a>
  ) : null;
};
