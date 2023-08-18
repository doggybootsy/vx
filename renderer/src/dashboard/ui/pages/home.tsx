import { useStateFromStores } from "renderer/hooks";
import { Icons } from "renderer/components";
import { cache } from "renderer/util";
import webpack from "renderer/webpack";
import DashboardPage, { HeaderBar } from "renderer/dashboard/ui/dashboardPage";

const UserStore = cache(() => webpack.getStore("UserStore")!);

function CurrentUser() {
  const React = webpack.common.React!;

  const user = useStateFromStores([ UserStore() ], () => UserStore().getCurrentUser());

  return (
    <span>
      {user.globalName ?? user.username}
    </span>
  );
};

function Home() {
  const React = webpack.common.React!;
  
  return (
    <DashboardPage
      header={[
        <HeaderBar.getter.Icon
          icon={Icons.Logo}
        />,
        <HeaderBar.getter.Title>
          Home
        </HeaderBar.getter.Title>
      ]}
    >
      <div className="vx-dashboard-home">
        <div style={{
          padding: 16,
          background: "rgb(75 12 159)"
        }}>
          INDEV
        </div>
        <div>Hello <CurrentUser /></div>
      </div>
    </DashboardPage>
  )
};

export default Home;