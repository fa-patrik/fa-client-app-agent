import { HTMLAttributes, useMemo } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { ReactComponent as FileIcon } from "assets/document-text.svg";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import { isValidUrl } from "utils/url";

function downloadBase64File(
  base64Data: string,
  contentType: string,
  fileName: string
): void {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data);
  const byteArrays: Uint8Array[] = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array<number>(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a).click();

  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

const DOWNLOAD_DOCUMENT = gql`
  query DownloadDocument($identifier: String!) {
    document(identifier: $identifier) {
      data
      mimeType
      fileName
    }
  }
`;

interface DownloadableDocumentProps extends HTMLAttributes<HTMLAnchorElement> {
  label: string;
  url?: string;
  documentIdentifier?: string;
}

export const DownloadableDocument = ({
  label,
  url,
  documentIdentifier,
  ...anchorAttributes
}: DownloadableDocumentProps) => {
  const { t } = useModifiedTranslation();
  const [downloadDocument] = useLazyQuery(DOWNLOAD_DOCUMENT);

  const isValidURL: boolean = useMemo(() => !!url && isValidUrl(url), [url]);
  const linkAttributes: JSX.IntrinsicElements["a"] = !documentIdentifier
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
        href: url,
      }
    : {
        href: "#",
        onClick: () => {
          downloadDocument({
            variables: {
              identifier: documentIdentifier,
            },
          })
            .then(({ data: { document } }) => {
              downloadBase64File(
                document.data,
                document.mimeType,
                document.fileName
              );
            })
            .catch((error) => toast.error(t("messages.error")));
        },
      };

  return isValidURL || document ? (
    <a {...linkAttributes} {...anchorAttributes}>
      <div className="flex justify-between text-primary-600 stroke-primary-600">
        <div className="text-base font-semibold">{label}</div>
        <FileIcon className="w-6 h-6 stroke-primary-600" />
      </div>
    </a>
  ) : null;
};
