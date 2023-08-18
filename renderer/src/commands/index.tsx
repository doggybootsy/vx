import { commands } from "renderer/commands/patches/common";
import { command } from "renderer/commands/types";
import "renderer/commands/patches";

export function addCommand(command: command) {
  if (!command.name) throw new TypeError("Argument 'command' requires a 'name' field!");
  if (!command.id) throw new TypeError("Argument 'command' requires a 'id' field!");
  if (!command.execute) throw new TypeError("Argument 'command' requires a 'execute' field!");

  const newCommand = {
    ...command,
    applicationId: "vx",
    get name() { return command.name; },
    get displayName() { return command.name; },
    get description() { return command.description ? command.description : ""; },
    get displayDescription() { return command.description ? command.description : ""; },
    type: 1,
    inputLevel: 0,
    id: `vx-${command.id}`,
    options: command.options ? Array.from(command.options, (option) => ({
      ...option,
      get choices() { return option.choices ? option.choices.map((choice) => ({
        get name() { return choice.name; },
        get displayName() { return choice.name; },
        value: choice.value
      })) : undefined; },
      get name() { return option.name; },
      get displayName() { return option.name; },
      get description() { return option.description ? option.description : ""; },
      get displayDescription() { return option.description ? option.description : ""; },
    })) : [ ]
  };

  commands.add(newCommand);

  return () => commands.delete(newCommand);
};

export function removeCommand(id: string) {
  const command = Array.from(commands).find((command) => command.id === `vx-${id}`);
  if (command) commands.delete(command);
};

import "renderer/commands/builtin";