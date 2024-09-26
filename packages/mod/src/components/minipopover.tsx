import { getProxyByKeys } from "@webpack";
import { className } from "../util";
import { Tooltip } from "./tooltip";
import { IconFullProps } from "./icons";

const minipopoverClasses = getProxyByKeys([ "button", "dangerous", "selected", "separator", "wrapper" ]);
const innerClasses = getProxyByKeys([ "icon", "buttonContent" ]);

interface MiniPopoverButtonProps {
  icon: React.ComponentType<IconFullProps>,
  text: string,
  onClick?(event: React.MouseEvent): void,
  onContextMenu?(event: React.MouseEvent): void,
  danger?: boolean,
  className?: string,
  disabled?: boolean,
  selected?: boolean,
  hideOnClick?: boolean
};

export function Button(props: MiniPopoverButtonProps) {
  return (
    <Tooltip
      text={props.text}
      spacing={8}
      hideOnClick={props.hideOnClick ?? true}
      children={(tprops) => (
        <div 
          {...tprops} 
          onClick={(event) => {
            tprops.onClick();
            if (props.disabled) return;
          
            if (props.onClick) props.onClick(event);
          }}
          onContextMenu={(event) => {
            tprops.onContextMenu();
            if (props.disabled) return;

            if (props.onContextMenu) props.onContextMenu(event);
          }}
          className={className([
            minipopoverClasses.button,
            props.danger && minipopoverClasses.dangerous,
            props.disabled && minipopoverClasses.disabled,
            props.selected && minipopoverClasses.selected,
            props.className
          ])}
        >
          <props.icon width={20} height={20} className={innerClasses.icon} />
        </div>
      )}
    />
  )
}
export function Separator() {
  return <div className={minipopoverClasses.separator} />;
}
