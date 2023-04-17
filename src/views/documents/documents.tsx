import { ReactNode } from "react";
import { Document } from "api/documents/types";
import classNames from "classnames";
import { Card } from "components";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import { useMatchesBreakpoint } from "../../hooks/useMatchesBreakpoint";
import { DocumentRow } from "./components/DocumentRow";
import { NoDocuments } from "./components/NoDocuments";

const DocumentTypeSingleSelectTagName = "Document type-";
const DefaultTypeTranslationKey = "documents";

const getDocumentTypeName = (tags: string) => {
  const typeNameFromTag = tags
    ?.split(",")
    ?.find((tag) => tag.startsWith(DocumentTypeSingleSelectTagName, 0))
    ?.split("-")?.[1];
  if (typeNameFromTag) return typeNameFromTag;
  return DefaultTypeTranslationKey;
};

interface DocumentsProps {
  data: Document[];
}

export const Documents = ({ data: documents }: DocumentsProps) => {
  const { t } = useModifiedTranslation();
  const isMdVersion = useMatchesBreakpoint("md");

  if (documents.length === 0) {
    return <NoDocuments />;
  }

  /**
   * Documents sorted by 1) the nr indicated in the document's TRANSLATED
   * Document Type- tag value and 2) based on the document's created at date.
   */
  const sortedDocuments = documents.sort((documentA, documentB) => {
    const typeTagNameOfA = getDocumentTypeName(documentA.tags);
    //the translation should contain the prefix nr that specifies the
    //order of the document, for example "Performance" -> "1Performance"
    const typeTagOfATranslated = t(`documentsPage.type.${typeTagNameOfA}`);
    const typeTagNrOfA = typeTagOfATranslated.charAt(0);
    const dateA = new Date(documentA.created)?.getTime();

    const typeTagNameOfB = getDocumentTypeName(documentB.tags);
    const typeTagOfBTranslated = t(`documentsPage.type.${typeTagNameOfB}`);
    const typeTagNrOfB = typeTagOfBTranslated.charAt(0);
    const dateB = new Date(documentB.created)?.getTime();

    if (
      typeTagNrOfA &&
      !isNaN(Number(typeTagNrOfA)) &&
      typeTagNrOfB &&
      !isNaN(Number(typeTagNrOfB))
    ) {
      if (typeTagNrOfA === typeTagNrOfB) {
        return dateB - dateA;
      } else {
        return Number(typeTagNrOfA) - Number(typeTagNrOfB);
      }
    }
    return dateB - dateA;
  });

  /**
   * Documents grouped by the document's
   * Document Type- tag value.
   */
  const groupedDocuments = sortedDocuments?.reduce((prev, curr) => {
    const typeName = getDocumentTypeName(curr.tags);
    const docsOfType = prev[typeName] || [];
    docsOfType.push(curr);
    prev[typeName] = docsOfType;
    return prev;
  }, {} as Record<string, Document[]>);

  //TODO: Replace the impromptu grid approach to a proper table
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedDocuments)?.map(([type, documents]) => (
        <Card
          key={type}
          header={
            /**
             * The translation may or may not contain a nr as first char.
             * But we don't want to show the nr if there is one.
             */
            isNaN(Number(t(`documentsPage.type.${type}`).charAt(0)))
              ? t(`documentsPage.type.${type}`)
              : t(`documentsPage.type.${type}`).substring(1)
          }
        >
          <div className="md:flex flex-col px-2 md:px-0 divide-y">
            {isMdVersion && (
              <div className="md:flex md:flex-row w-full">
                <HeaderLabel size="lg">{t("documentsPage.name")}</HeaderLabel>
                <HeaderLabel size="md" align="right">
                  {t("documentsPage.date")}
                </HeaderLabel>
                <HeaderLabel size="md" align="right">
                  {t("documentsPage.download")}
                </HeaderLabel>
              </div>
            )}
            {documents.map((document) => (
              <DocumentRow key={document.identifier} {...document} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

interface HeaderLabelProps {
  children: ReactNode;
  align?: "left" | "right";
  size: "lg" | "md";
}

const HeaderLabel = ({ children, align = "left", size }: HeaderLabelProps) => {
  return (
    <div
      className={classNames(
        "py-1 px-2 text-sm font-semibold text-gray-500 bg-gray-100 border-t",
        {
          "text-left": align === "left",
          "text-right": align === "right",
          "w-2/4": size === "lg",
          "w-1/4": size === "md",
        }
      )}
    >
      {children}
    </div>
  );
};
