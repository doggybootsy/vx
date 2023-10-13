import { className } from "../util";
import { Tooltip } from "./tooltip";

interface MiniPopoverButtonProps {
  icon(props: { width: number, height: number, className: string }): React.ReactNode,
  text: string,
  onClick(event: React.MouseEvent): void,
  onContextMenu?(event: React.MouseEvent): void,
  danger?: boolean,
  className?: string
};

export function Button(props: MiniPopoverButtonProps) {
  return (
    <Tooltip
      text={props.text}
      spacing={8}
      hideOnClick={true}
      children={(tprops) => (
        <div 
          {...tprops} 
          onClick={(event) => {
            props.onClick(event);
            tprops.onClick();
          }}
          onContextMenu={(event) => {
            if (props.onContextMenu) props.onContextMenu(event);
            tprops.onContextMenu();
          }}
          className={className([
            "vx-minipopover-button",
            props.danger && "vx-minipopover-danger",
            props.className
          ])}
        >
          <props.icon width={20} height={20} className="vx-minipopover-icon" />
        </div>
      )}
    />
  )
};
export function Separator() {
  return <div className="vx-minipopover-separator" />;
};
