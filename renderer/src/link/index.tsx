import webpack from "renderer/webpack";
import Link from "renderer/link/link";

const locations = {
  home: [ "home", "h" ],
  plugins: [ "plugins", "p" ],
  themes: [ "themes", "t" ],
  settings: [ "settings", "s" ],
  github: [ "github", "g" ]
};

const vxURLRegex = new RegExp(`^vx://(${Object.values(locations).flat(1).join("|")})/?`);;
const vxPluginsURLRegex = new RegExp(`^vx://(${locations.plugins.join("|")})/(\\w+).vx.js/?`);;

function getFullLocation(location: string) {
  for (const key in locations) {
    const element = locations[key] as string[];
    if (element.includes(location)) return key;
  }
};

webpack.getLazy<{
  defaultRules: VX.Dict,
  reactParserFor(rules: VX.Dict): Function,
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