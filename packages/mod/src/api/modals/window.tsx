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
  
  const domains = internalDataStore.get("trusted-domains")!.splice(0);
  domains.push(url.host);
  internalDataStore.set("trusted-domains", domains);
}

const open = (url: string | URL) => window.open(url, "_blank", "noopener,noreferrer");

export function openExternalWindowModal(url: string | URL) {
  url = new URL(url);

  if (linkIsTrusted(url)) {
    open(url);
    return;
  }

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
      window.open(url);
    },
    secondaryConfirmText: (
      Messages.TRUST_AND_VISIT_SITE.format({
        domain: url.host
      })
    ),
    onConfirmSecondary() {
      trustLink(url);
      open(url);
    }
  })
};