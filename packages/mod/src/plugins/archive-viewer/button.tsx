import { isZIP } from ".";
import { Tooltip } from "../../components";
import { ZIP } from "../../components/icons";
import { openZipModal } from "./modal";

interface ButtonProps {
  downloadURL?: string
};

export function ZipButton(props: ButtonProps) {  
  if (!props.downloadURL) return null;
  if (!isZIP(props.downloadURL)) return null;
  
  return (
    <Tooltip text="View Zip">
      {(ttProps) => (
        <div 
          {...ttProps} 
          className="vx-zip-button"
          onClick={() => {
            openZipModal(props.downloadURL!)
          }}
        >
          <ZIP size={20} />
        </div>
      )}
    </Tooltip>
  );
};