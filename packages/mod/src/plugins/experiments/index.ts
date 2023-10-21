import { definePlugin } from "..";
import { Developers } from "../../constants";

export default definePlugin({
  name: "Experiments",
  description: "Enables experiments",
  authors: [ Developers.doggybootsy ],
  patches: [
    {
      match: "DeveloperExperimentStore",
      replacements: [
        {
          find: /(isDeveloper:{configurable:!1,get:function\(\){return ).{1,3}?(})/,
          replace: "$1true$2"
        }
      ]
    },
    {
      // From replugged | idk how it works but it does
      match: "window.GLOBAL_ENV.RELEASE_CHANNEL",
      replacements: [
        {
          find: /window\.GLOBAL_ENV\.RELEASE_CHANNEL/g,
          replace: "'staging'"
        }
      ]
    }
  ]
});
