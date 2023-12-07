import { openModal } from "../../api/modals";
import { Tooltip } from "../../components";
import { ZIP } from "../../components/icons";
import { ZipModal } from "./modal";

interface ButtonProps {
  downloadMimeType?: string[],
  downloadURL?: string
};

function isZipMimeType(mimeType?: string[]) {
  if (!mimeType) return false;
  return mimeType.join("/") === "application/zip";
};

export function ZipButton(props: ButtonProps) {
  if (!props.downloadURL) return null;
  if (!isZipMimeType(props.downloadMimeType)) return null;
  
  return (
    <Tooltip text="View Zip">
      {(ttProps) => (
        <div 
          {...ttProps} 
          className="vx-zip-button"
          onClick={() => {
            openModal((modalProps) => <ZipModal {...modalProps} src={props.downloadURL!} />);
          }}
        >
          <ZIP size={20} />
        </div>
      )}
    </Tooltip>
  );
};