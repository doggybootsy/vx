import { openAlertModal } from ".";
import { Messages } from "vx:i18n";
import { internalDataStore } from "../storage";

function linkIsTrusted(url: string | URL) {
  url = new URL(url);
  
  internalDataStore.ensure("trusted-domains", []);
  return internalDataStore.get("trusted-domains")!.includes(url.host);
}
function trustLink(url: string | URL) {
  url = new URL(url);
  
  const links = internalDataStore.get("trusted-domains")!.splice(0);
  links.push(url.host);
}

export function openExternalWindowModal(url: string | URL) {
  url = new URL(url);

  if (linkIsTrusted(url)) {
    window.open(url, "_blank");
    return;
  };

  openAlertModal(Messages.MASKED_LINK_ALERT_V2_HEADER, [
    Messages.MASKED_LINK_ALERT_V2_WARNING_WEBSITE,
    <div className="vx-external-window-modal">
      <span className="vx-external-window-modal-protocol">{url.protocol}//</span>
      <span className="vx-external-window-modal-host">{url.host}</span>
      <span className="vx-external-window-modal-rest">{url.pathname}{url.search}{url.hash}</span>
    </div>
  ], {
    confirmText: Messages.MASKED_LINK_ALERT_V2_CONFIRM_WEBSITE,
    onConfirm() {
      window.open(url, "_blank");
    },
    secondaryConfirmText: (
      Messages.TRUST_AND_VISIT_SITE.format({
        domain: url.host
      })
    ),
    onConfirmSecondary() {
      trustLink(url);
      window.open(url, "_blank");
    }
  })
};