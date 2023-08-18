import { Icons } from "renderer/components";
import { cache } from "renderer/util";
import webpack, { CSSClasses, filters } from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { section } from "renderer/commands/patches/common";

type IconProps = {
  height: number,
  isSelected: boolean,
  padding?: number,
  className?: string,
  section: typeof section,
  selectable: boolean,
  width: number
};

const iconClasses = cache(() => webpack.getModule<CSSClasses>(m => m.icon && m.selectable)!);

function Icon(props: IconProps) {    
  const React = webpack.common.React!;
  
  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        padding: props.padding ? props.padding : 0
      }}
      className={`${iconClasses().wrapper}${props.className ? ` ${props.className}` : ""}${props.selectable ? ` ${props.selectable}` : ""}${props.isSelected ? ` ${iconClasses().selected}` : ""}`}
    >
      <Icons.Logo width={props.width} height={props.height} className={iconClasses().icon} />
    </div>
  )
};

webpack.getLazyAndKey(filters.byStrings(".type===", ".BUILT_IN?")).then(([ module, key ]) => {
  patcher.after("VX/Commands", (module as Record<string, (requestedSection: typeof section) => React.FunctionComponent>), key, (that, [ requestedSection ], res) => {
    if (requestedSection.id === section.id) return Icon;
    
    return res;
  });
});