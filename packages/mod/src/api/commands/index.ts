import "./patch";
import { commands, section } from "./patch";
import { Command } from "./types";

function addCommand(command: Command) {
  const cmd = {
    ...command,
    id: `vx-${command.id}`,
    applicationId: section.id,
    type: 1,
    predicate() {
      if (typeof command.predicate === "function") return command.predicate();
      return true;
    },
    get name() { return command.name },
    get displayName() { return command.name },
    get description() { return command.description || "" },
    get displayDescription() { return command.description || "" },
    isVX: true
  }

  if (Array.isArray(command.options)) {
    let options: any[];

    Object.defineProperty(cmd, "options", {
      get: () => {
        if (Array.isArray(options)) return options;

        options = [];
    
        for (const option of command.options!) {          
          const opt = {
            ...option,
            get choices() {
              if (!option.choices) return;
              
              return option.choices.map(m => ({ ...m, displayName: m.name }));
            },
            get name() { return option.name },
            get displayName() { return option.name },
            get description() { return option.description || "" },
            get displayDescription() { return option.description || "" }
          }

          options.push(opt);
        }

        return options;
      }
    })
  } 

  commands.set(cmd.id, cmd);
}

function removeCommand(id: string) {
  return commands.delete(id);
}

function hasCommand(id: string) {
  return commands.has(id);
}

export { addCommand, removeCommand, hasCommand };

import "./builtins";