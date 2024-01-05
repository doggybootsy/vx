import { Messages } from "i18n";
import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: () => Messages.EXPERIMENTS_NAME,
  description: () => Messages.EXPERIMENTS_DESCRIPTION,
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: "DeveloperExperimentStore",
      find: /(isDeveloper:{configurable:!1,get:function\(\){return ).{1,3}?}/,
      replace: "$1true}"
    },
    {
      // From replugged | idk how it works but it does
      match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
      find: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
      replace: "'staging'"
    }
  ]
});
