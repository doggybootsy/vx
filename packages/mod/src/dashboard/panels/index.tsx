import { Icons } from "../../components";
import { byKeys, byStrings, combine, getProxy, getProxyByProtoKeys, whenWebpackReady } from "../../webpack";
import { LayerManager, React } from "../../webpack/common";

import "./index.css";

const SettingsView = getProxyByProtoKeys<any>([ "renderSidebar" ]);

export default function Dashboard() {
  const [ section, setSection ] = React.useState("home");

  return (
    <SettingsView 
      sections={[
        {
          section: "HEADER",
          label: "VX" 
        },
        { 
          section: "home", 
          label: "Home", 
          element: () => (
            <div>
              <div>home</div>
            
              <div>body</div>
            </div>
          )
        },
        { 
          section: "plugins", 
          label: "Plugins",
          element: () => (
            <div>
              <div>PLUGINS</div>
              <div>body</div>
            </div>
          )
        }
      ]}
      section={section}
      onClose={LayerManager.popLayer}
      onSetSection={setSection}
    />
  )
};

whenWebpackReady().then(() => {
  LayerManager.pushLayer(Dashboard);
});