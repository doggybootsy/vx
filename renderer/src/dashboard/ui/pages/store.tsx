import webpack from "renderer/webpack";
import { Icons } from "renderer/components";
import DashboardPage, { HeaderBar } from "renderer/dashboard/ui/dashboardPage";

function Store() {
  const React = webpack.common.React!;

  return (
    <DashboardPage
      header={[
        <HeaderBar.getter.Icon
          icon={Icons.Store}
        />,
        <HeaderBar.getter.Title>
          Store
        </HeaderBar.getter.Title>
      ]}
    >
      nothing to see here
    </DashboardPage>
  )
};

export default Store;