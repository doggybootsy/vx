import { definePlugin } from "..";
import { Developers } from "../../constants";
import { getLazyByProtoKeys, getProxyByStrings } from "@webpack";
import { Injector } from "../../patcher";
import { createAbort } from "../../util";
import { MenuComponents, closeMenu, openMenu } from "../../api/menu";

const injector = new Injector()
const GIFPicker = getLazyByProtoKeys([ "renderGIF" ], { searchExports: true });
const useImageActions = getProxyByStrings<(src: string) => any>([ ".CONTEXT_MENU_LINK_OPENED", ".Messages.OPEN_LINK" ]);

const [ abort, getSignal ] = createAbort();

type DivHTMLElement = React.ReactElement<GetComponentProps<"div">, "div">;

function Menu({ src }: { src: string }) {
  const items = useImageActions(src);

  return (
    <MenuComponents.Menu navId="vx-image-actions-gif-item" onClose={closeMenu}>
      {items}
    </MenuComponents.Menu>
  )
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  async start() {
    const signal = getSignal();
    const GIFPickerSearchItem = await GIFPicker;    

    if (signal.aborted) return;

    injector.after(GIFPickerSearchItem.prototype, "render", (that, args, res) => {
      const url = (that as any).props.item.url;
      (res as DivHTMLElement).props.onContextMenu = (event) => {
        if (!url) return;

        openMenu(event, () => (
          <Menu src={url} />
        ));
      };
    });
  },
  stop() {
    injector.unpatchAll();
    abort();
  }
});
