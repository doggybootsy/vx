import { HeaderBar, Page } from ".";
import { Icons } from "../../components";

export function Home() {
  return (
    <Page header={
      <>
        <HeaderBar.Icon
          icon={Icons.Logo}
        />
        <HeaderBar.Title>
          Home
        </HeaderBar.Title>
      </>
    }>
      home
    </Page>
  )
};