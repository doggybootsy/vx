import { NoticeStoreType, Panel, createSection } from "..";
import { openUserModal } from "../../api/modals";
import { Button, Icons, Mask, Tooltip } from "../../components";
import { Switch } from "../../components/switch";
import { Developer, Developers } from "../../constants";
import { Plugin, plugins } from "../../plugins";
import { getRandomDefaultAvatar } from "../../util";
import { React, WindowUtil, useUser } from "../../webpack/common";

function createListenerHook() {
  const listeners = new Set<() => void>();

  return {
    emit() {
      for (const listener of listeners) {
        listener();
      }
    },
    use(listener: () => void) {
      React.useLayoutEffect(() => {
        listeners.add(listener);

        return () => void listeners.delete(listener);
      }, [ listener ]);
    }
  };
};

const onResetHook = createListenerHook();
const onSaveHook = createListenerHook();

function AuthorIcon({ dev, isLast }: { dev: Developer, isLast: boolean }) {
  const isVencord = dev === Developers.vencord;

  const user = isVencord ? null : useUser(dev.discord);

  const randomDefaultAvatar = React.useMemo(() => getRandomDefaultAvatar(), [ ]);

  const backgroundImage = React.useMemo(() => {
    const wrapURL = (url: string) => `url(${JSON.stringify(url)})`;

    if (isVencord) return wrapURL("https://avatars.githubusercontent.com/u/113042587?s=200&v=4");
    if (user) return wrapURL(user.getAvatarURL(undefined, 120, true));
    return wrapURL(randomDefaultAvatar);
  }, [ user ]);

  return (
    <Mask
      mask={isLast ? "none" : "avatar-overlay"}
      height={24}
      width={24}
    >
      <Tooltip text={dev.username}>
        {(props) => (
          <div 
            {...props}
            onClick={() => {
              if (isVencord) {
                WindowUtil.open({
                  href: "https://github.com/Vendicated/Vencord"
                });
                return;
              };
              openUserModal(dev.discord);
            }}
            className="vx-addon-author"
            style={{ backgroundImage }} 
          />
        )}
      </Tooltip>
    </Mask>
  );
};

function PluginCard({ plugin, onPluginToggle }: { plugin: Plugin, onPluginToggle: (plugin: string, showNotice: boolean) => void }) {
  const [ isEnabled, setEnabled ] = React.useState(() => plugin.isEnabled());

  onSaveHook.use(() => {
    onPluginToggle(plugin.name, false);

    if (isEnabled) return plugin.enable();
    plugin.disable();
  });
  onResetHook.use(() => {
    setEnabled(plugin.isEnabled());

    onPluginToggle(plugin.name, false);
  });
  
  return (
    <div className="vx-addon-card">
      <div className="vx-addon-top">
        <div className="vx-addon-icon-wrapper">
          <Icons.Code className="vx-addon-icon" height={32} width={32} />
        </div>
        <div className="vx-addon-details">
          <div className="vx-addon-name">
            {plugin.name}
          </div>
          <div className="vx-addon-authors">
            {plugin.exports.authors.map((dev, i) => (
              <AuthorIcon 
                dev={dev}
                isLast={i === (plugin.exports.authors.length - 1)}
                key={`vx-p-${plugin.name}-a-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="vx-addon-description">{plugin.exports.description}</div>
      <div className="vx-addon-divider" />
      <div className="vx-addon-footer">
        {/* <Button
          color={Button.Colors.RED}
          size={Button.Sizes.ICON}
        >
          <Icons.Trash />
        </Button> */}
        <div className="vx-addon-actions">
          <Switch 
            checked={isEnabled}
            onChange={() => {
              setEnabled(!isEnabled);

              onPluginToggle(plugin.name, isEnabled === plugin.isEnabled());
            }}
          />
        </div>
      </div>
    </div>
  )
};

export const pluginsSection = createSection({
  label: "Plugins",
  section: "plugins",
  onReset() {
    onResetHook.emit();
  },
  onSave() {
    onSaveHook.emit();
  },
  element(props) {
    const pluginKeys = Object.keys(plugins);

    const onPluginToggle = React.useMemo(() => {
      const pluginStates = new Map<string, boolean>();

      return (pluginName: string, showNotice: boolean) => {
        pluginStates.set(pluginName, showNotice);

        for (const [, showNotice] of pluginStates) {
          if (!showNotice) continue;

          props.notice.setShowNotice(true);
          return;
        };

        props.notice.setShowNotice(false);
      };
    }, [ ]);
  
    return (
      <Panel title="Plugins">
        <div className="vx-addons-warning">
          <Icons.Warn 
            width={20} 
            height={20} 
            className="vx-addons-icon" 
          />
          <span>
            You need to reload to enable plugins!
          </span>
        </div>
        <div className="vx-addons">
          {pluginKeys.map((key) => (
            <PluginCard 
              key={`vx-p-${key}`} 
              plugin={plugins[key]}
              onPluginToggle={onPluginToggle}
            />
          ))}
        </div>
      </Panel>
    );
  }
})