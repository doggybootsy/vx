import { definePlugin } from "vx:plugins";;
import { addItem, unpatchAll } from "../../api/minipopover";
import { Icons } from "../../components";
import { Button } from "../../components/minipopover";
import type { Props } from "../../api/minipopover/patch";
import { Developers } from "../../constants";
import { Constants, PermissionStore, subscribeToDispatch, useStateFromStores, Webhook, WebhooksActions, WebhooksStore } from "@webpack/common";
import { clipboard } from "../../util";
import { Messages } from "vx:i18n";
import { useState } from "react";
import { useDebounce } from "../../hooks";

function fetchForChannel(guildId: string, channelId: string) {
  return new Promise<Webhook[]>((resolve) => {
    const undo = subscribeToDispatch("WEBHOOKS_UPDATE", (data) => {
      if (data.guildId === guildId && data.channelId === channelId) {
        undo();
        
        resolve(
          WebhooksStore.getWebhooksForChannel(guildId, channelId)
        );
      }
    });

    WebhooksActions.fetchForChannel(guildId, channelId);
  });
}

export default definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  async copy(props: Props) {
    const webhooks = await fetchForChannel(props.guild!.id, props.channel.id);

    for (const webhook of webhooks) {
      if (webhook.id !== props.author.id) continue;

      await clipboard.copy(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`);

      return;
    }
  },
  start() {
    addItem("get-webhook-url", (props) => {
      const [ state, setState ] = useState<0 | 1 | 2>(0);

      const revert = useDebounce(() => setState(0), [ ], 1000);

      const canManagaWebhooks = useStateFromStores<boolean>([ PermissionStore ], () => (
        PermissionStore.can(Constants.Permissions.MANAGE_WEBHOOKS, props.channel)
      ));

      if (!props.guild) return null;
      if (props.author.discriminator !== "0000") return null;
      if (!canManagaWebhooks) return null;

      return (
        <Button
          icon={(props) => <Icons.DiscordIcon {...props} name="WebhookIcon" />} 
          text={state === 2 ? Messages.INTEGRATIONS_WEBHOOK_COPIED_URL : state === 1 ? Messages.LOADING : Messages.INTEGRATIONS_WEBHOOK_COPY_URL}
          disabled={state === 1}
          hideOnClick={false}
          onClick={async () => {
            setState(1);

            await this.copy(props);
            
            setState(2);
            revert();
          }}
        />
      )
    });
  },
  stop() {
    unpatchAll("get-webhook-url");
  },
});
