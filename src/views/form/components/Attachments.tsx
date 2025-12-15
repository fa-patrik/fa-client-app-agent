import { ReactComponent as DownloadIcon } from "assets/download.svg";
import { Button, Card } from "components";
import { saveAs } from "file-saver";
import { useModifiedTranslation } from "hooks/useModifiedTranslation";
import type { Attachment } from "../useProcessExecutor";

interface AttachmentsProps {
  attachments: Attachment[];
}

const downloadAttachment = async (base64: string, name: string) => {
  saveAs(base64, name);
};

export const Attachments = ({ attachments }: AttachmentsProps) => {
  const { t } = useModifiedTranslation();
  return (
    <Card header={t("formPage.attachments")}>
      <div className="px-3">
        {attachments.map(({ name, base64 }) => (
          <div
            className="flex gap-2 justify-between items-center py-2"
            key={name}
          >
            <div className="overflow-hidden ">
              <div className="text-base font-semibold truncate">{name}</div>
            </div>
            <Button
              variant="Dark"
              size="xs"
              LeftIcon={DownloadIcon}
              onClick={() => downloadAttachment(base64, name)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
