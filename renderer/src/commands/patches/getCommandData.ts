import webpack, { filters } from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { setLikeArray, section, commands } from "renderer/commands/patches/common";
import { command } from "renderer/commands/types";

webpack.getLazyAndKey(filters.byStrings(".applicationCommands", ".getScoreWithoutLoadingLatest")).then(([ module, key ]) => {
  patcher.after("VX/Commands", module, key, (that, args, res) => {        
    if (res.activeSections.length - 1) {
      res.activeSections = setLikeArray([
        ...res.activeSections,
        section
      ], (a, b) => a.id === b.id);
    };

    res.sectionDescriptors = setLikeArray([
      ...res.sectionDescriptors,
      section
    ], (a, b) => a.id === b.id);

    res.commands = setLikeArray(res.commands, (a: command, b: command) => a.id === b.id);

    const builtInCommands = res.commandsByActiveSection.find(({ section }) => section.id === "-1");
    if (builtInCommands) {
      builtInCommands.data = builtInCommands.data.filter((command: { applicationId: string }) => command.applicationId !== "vx");
    }

    if (res.filteredSectionId === section.id || !res.filteredSectionId) {
      const activeSection = res.commandsByActiveSection.find((cmd) => cmd.section === section);
      if (!activeSection) res.commandsByActiveSection.push({
        section: section,
        data: Array.from(commands)
      });
      else activeSection.data = Array.from(commands);
    };

    res.commandsByActiveSection = res.commandsByActiveSection.filter(({ section }, index) => {
      return res.commandsByActiveSection.findIndex((cmd) => cmd.section.id === section.id) === index;
    });
    
    if (res.filteredSectionId === section.id) {
      res.placeholders = [ ];
      res.hasMoreAfter = false;
      res.loading.current = false;
      res.commands = Array.from(commands);
    }
  });
});