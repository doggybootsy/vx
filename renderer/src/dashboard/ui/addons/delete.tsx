import { Plugin } from "renderer/addons/plugins";
import { Theme } from "renderer/addons/themes";
import { Markdown } from "renderer/components";
import { openModal } from "renderer/modal";
import native from "renderer/native";
import webpack from "renderer/webpack";

export function openDeleteAddonModal(addon: Plugin | Theme) {
  const React = webpack.common.React!;
  const components = webpack.common.components!;
  
  // Use a custom confirm modal so we can set loading
  openModal((props) => {
    const [ loading, setLoading ] = React.useState(false);

    return (
      <components.ConfirmModal
        header="Are you sure?"
        className="vx-modals-confirm-modal"
        confirmText="Delete"
        onConfirm={async () => {
          setLoading(true);

          await native.delete(addon.filepath);
          props.onClose();
        }}
        loading={loading}
        cancelText="Cancel"
        confirmButtonColor={components.Button.Colors.RED}
        onClose={() => props.onClose()}
        transitionState={props.transitionState}
      >
        <div className="vx-modals-content-line">
          <Markdown text={`Do you want to uninstall ${addon.meta.name ? `\`${addon.meta.name}\` (\`${addon.id}\`)` : `\`${addon.id}\``}`} />
        </div>
        <div className="vx-modals-content-line">
          <Markdown text="Deleted addons should show up in your recycle bin or recently deleted folder" />
        </div>
      </components.ConfirmModal>
    );
  });
};