import { useState } from "react";
import { saveAs } from "file-saver";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { toast } from "react-toastify";
import { addProtocolToUrl } from "utils/url";
import { useGetDocumentData } from "./useGetDocumentData";

/**
 * The handleEncodedURL function processes the provided URL to initiate the download of a document or open it in a new browser tab.
 *
 * @param {string} url - The URL of the document. If the filename ends with '.link', this URL should be a Base64 encoded string.
 * @param {string} fileName - The name of the file to be downloaded. If this ends with '.link', the URL parameter is treated as a Base64 encoded URL.
 *
 * The function operates based on the filename:
 * - If the filename ends with '.link', it treats the URL as a Base64 encoded URL, decodes it, and opens the decoded URL in a new browser tab.
 * - If the filename does not end with '.link', it treats the URL as a direct link to the document and initiates a download of the document.
 */
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

/**
 * useDownloadDocument is a React hook providing functionality to download documents.
 *
 * @returns {{
 *  downloadDocument: (identifier: string, documentDataURLFormat?: "base64" | "string") => Promise<void>,
 *  downloading: boolean
 * }}
 *
 * The hook returns an object with two properties:
 * - downloadDocument: This function takes an identifier for the document to be downloaded and an optional format specifier. The format specifier can be either "base64" or "string", defaulting to "string". Depending on this specifier, the function fetches the document data and either directly downloads the document (in the case of "string") or uses the handleEncodedURL function to process the URL (in the case of "base64").
 * - downloading: A stateful boolean value indicating the current download status. It returns true when a download is ongoing and false otherwise.
 */
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
