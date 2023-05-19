import { HTMLAttributes, useMemo } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { ReactComponent as FileIcon } from "assets/document-text.svg";
import { isValidUrl } from "utils/url";

interface DownloadableDocumentProps extends HTMLAttributes<HTMLAnchorElement> {
  label: string;
  url?: string;
  documentIdentifier?: string;
}

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

  const a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;

  a.click();

  window.URL.revokeObjectURL(url);

  // Clean up
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

export const DownloadableDocument = ({
  label,
  url,
  documentIdentifier,
  ...anchorAttributes
}: DownloadableDocumentProps) => {
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
            .catch((err) => console.error(err));
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
