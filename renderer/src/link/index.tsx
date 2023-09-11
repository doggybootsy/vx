import webpack from "renderer/webpack";
import Link from "renderer/link/link";
import * as markdown from "renderer/markdown";

const locations = {
  home: [ "home", "h" ],
  plugins: [ "plugins", "p" ],
  themes: [ "themes", "t" ],
  settings: [ "settings", "s" ],
  github: [ "github", "git", "g" ]
};

const vxURLRegex = new RegExp(`^vx://(${Object.values(locations).flat(1).join("|")})/?`);;
const vxPluginsURLRegex = new RegExp(`^vx://(${locations.plugins.join("|")})/(\\w+).vx.js/?`);;

function getFullLocation(location: string) {
  for (const key in locations) {
    const element = locations[key] as string[];
    if (element.includes(location)) return key;
  }
};

markdown.register("vx-url", {
  order: 16,
  match(text, state) {
    // If links aren't allowed in chat then dont match
    // But we don't wanna just a truthy / falsey, so we use in
    if (("allowLinks" in state && typeof state.allowLinks === "boolean") ? !state.allowLinks : false) return null;    

    return vxPluginsURLRegex.exec(text) || vxURLRegex.exec(text);
  },
  parse(capture: RegExpExecArray) {      
    const node = {
      capture,
      type: "vx-url"
    };

    return node;
  },
  react(node) {
    const React = webpack.common.React!;
    const location = getFullLocation(node.capture.at(1)!)!;
    const pluginId = node.capture.at(2);

    return <Link location={location} pluginId={pluginId} />;
  }
});
