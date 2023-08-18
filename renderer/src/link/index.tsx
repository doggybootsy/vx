import webpack from "renderer/webpack";
import Link from "renderer/link/link";

const locations = {
  home: [ "home", "h" ],
  plugins: [ "plugins", "p" ],
  themes: [ "themes", "t" ],
  settings: [ "settings", "s" ],
};

const vxURLRegex = new RegExp(`^vx://(${Object.values(locations).flat(1).join("|")})/?`);;
const vxPluginsURLRegex = new RegExp(`^vx://(${locations.plugins.join("|")})/(\\w+).vx.js/?`);;

function getFullLocation(location: string) {
  if (location === "h" || location === "home") return "home";
  if (location === "p" || location === "plugins") return "plugins";
  if (location === "t" || location === "themes") return "themes";
  if (location === "s" || location === "settings") return "settings";
};

webpack.getLazy<{
  defaultRules: VX.Dict<any>,
  reactParserFor(rules: VX.Dict<any>): Function,
  parse: Function
}>((m) => m.parse && m.defaultRules).then((markdownParser) => {
  markdownParser.defaultRules["vx-url"] = {
    order: markdownParser.defaultRules.url.order,
    match(text: string) {
      return vxPluginsURLRegex.exec(text) || vxURLRegex.exec(text);
    },
    parse(capture: RegExpExecArray) {      
      const node = {
        capture,
        type: "vx-url"
      };

      return node;
    },
    react(node: { capture: RegExpExecArray }) {
      const React = webpack.common.React!;
      const location = getFullLocation(node.capture.at(1)!)!;
      const pluginId = node.capture.at(2);

      return <Link location={location} pluginId={pluginId} />;

      // return (
      //   <span
      //     className="vx-url"
      //     onClick={() => {
      //       const url = pluginId ? `/vx/plugins/${pluginId}.vx.js` : `/vx/${location === "home" ? "" : location}`;

      //       webpack.common.navigation!.transitionTo(url);
      //     }}
      //   >
      //     {content}
      //   </span>
      // );
    }
  };

  markdownParser.parse = markdownParser.reactParserFor(markdownParser.defaultRules);
});