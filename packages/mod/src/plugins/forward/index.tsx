import { Message } from "discord-types/general";
import { definePlugin } from "..";
import { Developers } from "../../constants";
import { createAbort, findInReactTree } from "../../util";
import { Injector } from "../../patcher";
import { getLazyByKeys, getProxyByKeys } from "@webpack";
import { isValidElement } from "react";
import { MenuComponents } from "../../api/menu";
import { Icons } from "../../components";
import { FluxDispatcher, TextAreaInput } from "@webpack/common";
import { waitForNode } from "common/dom";
import { Messages } from "vx:i18n";

const [ abort, getCurrentSignal ] = createAbort();
const injector = new Injector();

const QuickSwitcher = getProxyByKeys<{
  show(): void
}>([ "hide", "selectResult" ]);

async function openForwardModal(message: Message) {
  function deleteListeners() {
    // 'QUICKSWITCHER_HIDE' runs before 'QUICKSWITCHER_SWITCH_TO' so it needs to wait 
    queueMicrotask(() => {
      FluxDispatcher.unsubscribe("QUICKSWITCHER_SWITCH_TO", onUserSelect);
      FluxDispatcher.unsubscribe("QUICKSWITCHER_HIDE", deleteListeners);
    });
  }

  async function onUserSelect() {
    deleteListeners();

    const attachments = Promise.all(
      message.attachments.map(async (attachment) => {
        const req = await fetch(attachment.proxy_url);
        const type = req.headers.get("content-type") ?? "application/octet-stream";

        const lastModifiedHeader = req.headers.get("last-modified");
        let lastModified = lastModifiedHeader ? new Date(lastModifiedHeader) : new Date();
        if (lastModified.toString() === "Invalid Date") lastModified = new Date();
        
        return new File([ await req.blob() ], attachment.proxy_url.split("/").at(-1)!.split("?").at(0)!, { type: type, lastModified: lastModified.getTime() });
      })
    );

    TextAreaInput.clearText();

    TextAreaInput.insert(
      message.content,
      await attachments
    );
  }

  FluxDispatcher.subscribe("QUICKSWITCHER_SWITCH_TO", onUserSelect);
  FluxDispatcher.subscribe("QUICKSWITCHER_HIDE", deleteListeners);

  QuickSwitcher.show();

  const input = await waitForNode<HTMLInputElement>(`input[placeholder=${JSON.stringify(Messages.QUICKSWITCHER_PLACEHOLDER)}]`);

  input.placeholder = Messages.WHERE_TO_FORWARD;
};

type useMessageMenu = (props: { message: Message }) => React.ReactNode;

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  async start() {
    const signal = getCurrentSignal();

    const module = await getLazyByKeys<{ useMessageMenu: useMessageMenu }>([ "useMessageMenu" ]);
    if (signal.aborted) return;

    injector.after(module, "useMessageMenu", (that, args, res) => {
      if (!isValidElement(res)) return;

      const props = findInReactTree<{ children: (React.ReactElement | null)[] }>(res, (item) => item?.children?.length > 8);
      if (!props) return;
      
      const index = props.children.findIndex((v) => v?.props?.id === "reply");
      if (!~-index) return;

      props.children.splice(
        index + 1, 
        0,
        <MenuComponents.MenuItem 
          label={Messages.FORWARD}
          id="vx-forward"
          icon={Icons.Forward}
          action={() => openForwardModal(args[0].message)}
        />
      );
    });
  },
  stop() {
    injector.unpatchAll();
    abort();
  }
});

