import webpack from "renderer/webpack";
import DashboardPage, { HeaderBar } from "renderer/dashboard/ui/dashboardPage";
import { Icons, Switch } from "renderer/components";
import storage from "renderer/storage";

function Settings() {
  const React = webpack.common.React!;

  const addonsGridLayout = storage.use("addons-grid-layout", true);

  const notificationsEnabled = storage.use("notifications-enabled", true);
  const notificationsRightClickCloseAll = storage.use("addons-right-click-close-all", true);

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
        <div>
          Addons
        </div>
        <div>
          <Switch
            value={addonsGridLayout}
            onChange={(newValue) => storage.set("addons-grid-layout", newValue)}
          >
            Grid Layout
          </Switch>
        </div>
      </div>
      <div>
        <div>
          Notifications
        </div>
        <div>
          <Switch
            value={notificationsEnabled}
            onChange={(newValue) => storage.set("notifications-enabled", newValue)}
            note="Notification's will not show until this is enabled."
          >
            Enabled
          </Switch>
          <Switch
            value={notificationsRightClickCloseAll}
            onChange={(newValue) => storage.set("addons-right-click-close-all", newValue)}
            disabled={!notificationsEnabled}
          >
            Right Click Close All
          </Switch>
        </div>
      </div>
    </DashboardPage>
  )
};

export default Settings;