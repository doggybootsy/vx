import { getProxyStore } from "@webpack";
import { definePlugin } from "..";
import { openImageModal } from "../../api/modals";
import { Developers } from "../../constants";
import { useStateFromStores } from "@webpack/common";
import { Icons } from "../../components";
import * as styler from "./index.css?managed";

const ApplicationStreamPreviewStore = getProxyStore("ApplicationStreamPreviewStore");

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: {
    match: "this.renderPreview",
    find: /this.renderPreview\(.{1,3}\)/,
    replace: "$&,$enabled&&$jsx($self.PreviewButton,{component:this})"
  },
  styler,
  PreviewButton({ component }: { component: React.Component<any, any> }) {
    const { canWatch, stream } = component.props;

    const previewUrl = useStateFromStores([ ApplicationStreamPreviewStore ], () => (
      stream && ApplicationStreamPreviewStore.getPreviewURL(
        stream.guildId,
        stream.channelId,
        stream.ownerId
      )
    ), [ stream ]);

    if (!canWatch) return;
    if (!previewUrl) return;
    
    return (
      <div onClick={() => openImageModal(previewUrl, { scale: 10 })} className="vx-bsp">
        <Icons.WindowLaunchIcon />
      </div>
    )
  }
});