import {getProxy, getProxyByStrings, getProxyStore} from "@webpack";
import { definePlugin } from "vx:plugins";
import { Developers } from "../../constants";
import {Message, User} from "discord-types/general";
import { Component } from "react";
import { Icons, Tooltip } from "../../components";
import * as styler from "./index.css?m";
import { Messages } from "vx:i18n";

const PresenceStore = getProxyStore("PresenceStore");

interface PlatformIndicatorsProps {
  userId: string
  size?: number;
}
type PlatformIndicatorsState = Record<
  "web" | "desktop" | "mobile" | "embedded", 
  string
>;

const icons = {
  mobile: Icons.DiscordIcon.from("MobilePhoneIcon"),
  web: Icons.DiscordIcon.from("GlobeEarthIcon"),
  desktop: Icons.DiscordIcon.from("ScreenIcon"),
  embedded: Icons.DiscordIcon.from("GameControllerIcon"),
  unknown: Icons.DiscordIcon.from("GameControllerIcon")
};

const useStatusColor = getProxyByStrings<(status: string) => string>([ 
  ".GREEN_360;case", 
  ".ONLINE:return ", 
  ".YELLOW_300;case", 
  ".DND:return "
], { searchExports: true })

function Item({ platform, status, size }: { platform: keyof PlatformIndicatorsState, status: string, size?: number }) {
  const Icon = icons[platform] || icons.unknown;

  const color = useStatusColor(status);

  return (
    <Tooltip text={Messages[`STATUS_${status.toUpperCase()}` as Uppercase<string>]}>
      {(props) => (
        <span role="button" tabIndex={0} data-platform={platform} data-status={status}>
          <div {...props} style={{ color }} className="vx-pi">
            <Icon size={size ?? 20} />
          </div>
        </span>
      )}
    </Tooltip>
  );
}

class PlatformIndicators extends Component<PlatformIndicatorsProps> {
  private static getStatuses(userId: string): PlatformIndicatorsState {
    return { ...PresenceStore.getClientStatus(userId) };
  }

  constructor(props: PlatformIndicatorsProps) {
    super(props);

    this.status = PlatformIndicators.getStatuses(props.userId);
  }

  private status: PlatformIndicatorsState;

  private listener = () => {
    this.status = PlatformIndicators.getStatuses(this.props.userId);
    this.forceUpdate();
  };
  componentDidMount(): void {
    PresenceStore.addChangeListener(this.listener);
  }
  componentWillUnmount(): void {
    PresenceStore.removeChangeListener(this.listener);
  }

  render(): React.ReactNode {    
    return Object.entries(this.status).map(([ platform, status ]) => (
      <Item size={this.props.size} platform={platform as keyof PlatformIndicatorsState} status={status} />
    ));
  }
}

const nameModule = getProxy(x=>x.nameAndDecorators)

definePlugin({
  authors: [ Developers.doggybootsy ],
  requiresRestart: false,
  patches: [
    {
      match: "suppress-notifications",
      find: /,null!=.{1,3}&&\((.{1,3})\.push\(\(0,.{1,3}\.jsx\)\(.{1,3}\..{1,3},{guild:.{1,3},message:(.{1,3})},"new-member"\)\),/,
      replace: ",$enabled&&$self.addIcon($1,$2)$&"
    },
    {
      match: '.nameAndDecorators,',
      find: /(({className:.{1,3}.nameAndDecorators,children:\[))\(0,.{1,3}jsx\)\("div",{className:r\(\)\(.{1,3}.name,{\[.{1,3}.wrappedName]:.{1,4}}\),children:(.{1,2})}\),(\w+)(\]})/,
      replace: "$2$3,[$enabled&&$self.addIconJsx(...arguments), $4],$5"
    }
  ],
  addIcon(array: React.ReactNode[], message: Message) {
    array.push(
      <PlatformIndicators userId={message.author.id} />
    );
  },
  addIconJsx(args) {
    const subText = args?.subText
    return subText && subText?.props?.props && <PlatformIndicators size={15} userId={subText?.props.props.user?.id} />
  },
  styler
});