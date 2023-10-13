import { HeaderBar, Page } from ".";
import { Icons } from "../../components";

export function Plugins() {
  return (
    <Page header={
      <>
        <HeaderBar.Icon
          icon={Icons.Code}
        />
        <HeaderBar.Title>
          Plugins
        </HeaderBar.Title>
      </>
    }>
      plugins
    </Page>
  )
};