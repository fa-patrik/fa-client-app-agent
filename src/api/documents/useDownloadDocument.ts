import { useState } from "react";
import { saveAs } from "file-saver";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import { addProtocolToUrl } from "utils/url";
import { useGetDocumentData } from "./useGetDocumentData";

function handleEncodedURL(url: string, fileName: string) {
  const isURL = fileName.endsWith(".link");
  if (isURL) {
    const [, linkBase64] = url.split(";base64,");
    const link = window.atob(linkBase64);
    window.open(addProtocolToUrl(link), "_blank");
  } else {
    saveAs(url, fileName);
  }
}

export const useDownloadDocument = () => {
  const { t } = useModifiedTranslation();
  const { getDocumentData } = useGetDocumentData();
  const [downloading, setDownloading] = useState(false);

  const downloadDocument = async (
    identifier: string,
    documentDataURLFormat: "base64" | "string" = "string"
  ) => {
    setDownloading(true);
    const documentQueryResolvedPromise = await getDocumentData(identifier);
    if (documentQueryResolvedPromise.data) {
      const documentData = documentQueryResolvedPromise.data.document;
      if (documentData.url) {
        switch (documentDataURLFormat) {
          case "string": {
            const res = await fetch(documentData.url);
            const blob = await res.blob();
            saveAs(blob, documentData.fileName);
            break;
          }
          case "base64":
            handleEncodedURL(documentData.url, documentData.fileName);
            break;
        }
      }
      if (documentQueryResolvedPromise.error) {
        toast.error(
          documentQueryResolvedPromise.error.message || t("messages.error")
        );
      }
      setDownloading(false);
    }
  };

  return { downloadDocument, downloading };
};
