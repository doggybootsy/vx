import { addPlainTextPatch, byKeys, byStrings, combine, getMangledLazy, getProxy } from "@webpack"
import { Injector } from "../../patcher";
import { Icons } from "../../components";
import { className } from "../../util";
import { Command } from "./types";

const injector = new Injector();

export const section = {
  id: "vx",
  type: 0,
  name: "VX"
}

export const commands: Map<string, Command> = new Map();

async function addBuiltinSection() {
  const module = await getMangledLazy<{
    BUILTIN_SECTIONS: Record<string, any>,
    getBuiltInCommands(types: number[], idk1: boolean, idk2: boolean): any[]
  }>("fI5MTU", {
    BUILTIN_SECTIONS: m => typeof m === "object",
    getBuiltInCommands: m => typeof m === "function"
  });    

  module.BUILTIN_SECTIONS[section.id] = section;

  injector.after(module, "getBuiltInCommands", (that, [ types ], res) => {        
    if (!types.includes(1)) return;
    
    if (!Array.isArray(res)) res = [];    

    return injector.return([ ...res, ...commands.values() ]);
  });
}

interface IconProps {
  height: number,
  width: number,
  className: string,
  padding: number,
  isSelected: boolean,
  selectable: boolean
}

const iconClasses = getProxy(combine(byKeys("wrapper", "icon", "selected", "selectable"), m => !m.mask));

async function patchIcon() {
  const module = await getMangledLazy<{
    ApplicationIcon(section: { id: string }): React.FunctionComponent<any>
  }>("hasSpaceTerminator:", {
    ApplicationIcon: byStrings(".type===", ".BUILT_IN?")
  });

  function Logo(props: IconProps) {    
    return (
      <div
        style={{
          width: props.width,
          height: props.height,
          padding: props.padding ? props.padding : 0
        }}
        className={className([
          iconClasses.wrapper,
          props.className,
          props.isSelected && iconClasses.selected,
          props.selectable && iconClasses.selectable
        ])}
      >
        <Icons.Logo width={props.width} height={props.height} className={iconClasses.icon} />
      </div>
    )
  }

  injector.after(module, "ApplicationIcon", (that, [ { id } ]) => {
    if (id !== section.id) return;
    return injector.return(Logo);
  });
}

async function patchApplication() {
  const module = await getMangledLazy<{
    key(...args: any): any
  }>("Failed to select application descriptor", {
    key: byStrings(".getScoreWithoutLoadingLatest")
  });  

  injector.after(module, "key", (that, args, res) => {     
    if (!args[2].commandTypes.includes(1)) return;    
      
    for (const sectionedCommand of res.sectionedCommands) {
      if (sectionedCommand.section.id !== "-1") continue;

      sectionedCommand.data = sectionedCommand.data.filter((m: any) => !m.isVX);
    }    

    const cmds = Array.from(commands.values()).filter(m => m.predicate!());    

    res.sectionedCommands.push({
      section, 
      data: cmds
    });
    res.descriptors.push(section);
    res.commands.push(...cmds);
  })
}

addPlainTextPatch({
  identifier: "vx(commands add section)",
  match: "AutocompleteRow: renderContent must be extended",
  find: "return this.isSelectable()",
  replace: "if(this.props.command?.isVX)this.props.section=$section;$&",
  _self: {
    section: JSON.stringify(section)
  }
})

patchApplication();
addBuiltinSection();
patchIcon();