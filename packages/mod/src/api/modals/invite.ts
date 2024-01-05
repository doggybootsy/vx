import { getProxyByKeys } from "@webpack";
import { FluxDispatcher, GuildStore, InviteActions, dirtyDispatch } from "@webpack/common";

const native = getProxyByKeys([ "close", "focus" ]);

export async function openInviteModal(code: string) {
  const { invite } = await InviteActions.resolveInvite(code, "Desktop Modal");
  
  if (!invite) throw new Error("Invite not found!");
  

  const { minimize, focus } = native;

  native.minimize = () => {};
  native.focus = () => {};

  await dirtyDispatch({
    type: "INVITE_MODAL_OPEN",
    invite,
    code,
    context: "APP"
  });

  setTimeout(() => {
    native.minimize = minimize;
    native.focus = focus;
  });
  
  if (GuildStore.getGuild(invite.guild.id)) return Promise.resolve(true);

  return new Promise<Boolean>((resolve) => {
    function onAccept(data: { code: string }) {
      if (data.code !== code) return;

      resolve(true);
    };
    function onClose() {
      FluxDispatcher.unsubscribe("INVITE_ACCEPT", onAccept);
      FluxDispatcher.unsubscribe("INVITE_MODAL_CLOSE", onClose);

      resolve(false);
    };

    FluxDispatcher.subscribe("INVITE_ACCEPT", onAccept);
    FluxDispatcher.subscribe("INVITE_MODAL_CLOSE", onClose);
  });
};