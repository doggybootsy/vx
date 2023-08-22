import webpack from "renderer/webpack";
import DashboardPage, { HeaderBar } from "renderer/dashboard/ui/dashboardPage";
import { Icons } from "renderer/components";

function Settings() {
  const React = webpack.common.React!;

  return (
    <DashboardPage
      header={[
        <HeaderBar.getter.Icon
          icon={Icons.Gear}
        />,
        <HeaderBar.getter.Title>
          Settings
        </HeaderBar.getter.Title>
      ]}
    >
      <div>
        ADDON: Grid layout
      </div>
      <div>
        NOTIFS: Enable
      </div>
      <div>
        NOTIFS: Right Click Close All
      </div>
      <div>
        CUSTOM CSS: Enable
      </div>
      <div>
        DIR: Custom DIR
      </div>
    </DashboardPage>
  )
};

export default Settings;