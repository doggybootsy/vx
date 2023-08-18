import { findInReactTree, getOwnerInstance, waitForNode } from "renderer/util";
import webpack, { CSSClasses, filters } from "renderer/webpack";
import * as patcher from "renderer/patcher";
import { routes } from "renderer/dashboard/routes";
import Page from "renderer/dashboard/ui";

interface RouteProps {
  disableTrack: boolean,
  path: string | string[],
  render: React.FunctionComponent
};

(async function() {
  const { container } = await webpack.getLazy<CSSClasses<"container">>((m) => m.container && m.fullWidth && m.hasNotice);

  const element = await waitForNode(`.${container}`);
  
  const instance = getOwnerInstance(element);
  if (!instance) return;

  const Route = webpack.getModule<React.FunctionComponent<RouteProps>>(filters.byStrings(".impressionProperties,", "impressionProperties"))!;
  const React = webpack.common.React!;

  let type;
  function NewType(this: any) {
    const res = type.call(this, ...arguments);    

    const children = findInReactTree(res, (item) => item?.length > 5) as React.ReactElement[];
    if (children) {
      children.push(
        <Route
          disableTrack={true}
          path={routes}
          render={() => <Page />}
        />
      )
    };

    return res;
  };

  patcher.after("VX/dashboard", instance, "render", (that, args, res) => {    
    const props = (res as React.ReactElement).props;    
        
    if (type !== NewType) type = props.children.type;

    props.children = (
      <NewType />
    );
  });

  instance.forceUpdate();
})();