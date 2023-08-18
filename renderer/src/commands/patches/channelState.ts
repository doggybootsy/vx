import webpack from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { setLikeArray, section, commands } from "renderer/commands/patches/common";
import { command } from "renderer/commands/types";

webpack.getLazy<any>((m) => m.getName?.() === "ApplicationCommandSearchStore").then((ApplicationCommandSearchStore) => {
  patcher.after("VX/Commands", ApplicationCommandSearchStore, "getChannelState", (that, args, res) => {
    if (!res) return;
    
    if (res.applicationSections) res.applicationSections = setLikeArray([ ...res.applicationSections, section ], (a, b) => a.id === b.id);

    for (const [ search, data ] of res.queries) {
      const filtered = Array.from(commands).filter((cmd) => cmd.name.toLowerCase().includes(search));
      const newCommands = setLikeArray<command>([ ...data.commands, ...filtered ], (a, b) => a.id === b.id);
            
      data.commands = newCommands.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
      
      if (data.commands.length) data.scrollDownCursor = res.scrollDownCursor;
    };    

    return res;
  });
});