import { User } from "discord-types/general";
import { Popout, PopoutProps, RenderPopoutProps } from "./popout";
import { byStrings, getMangledProxy, getProxy, getProxyByKeys, webpackRequire } from "@webpack";
import { UserStore, fetchUser } from "@webpack/common";
import { Component } from "react";
import { Spinner } from "./spinner";

interface UserPopoutProps extends Omit<PopoutProps, "renderPopout"> {
  user: User | string;
  guildId?: string;
  channelId?: string;
}

const preloader = getMangledProxy<{ maybeFetchUserProfileForPopout(user: User, data: any): Promise<void> }>("preloadUserProfileForPopout", {
  maybeFetchUserProfileForPopout: () => true
});

const UserPopoutModule = getProxy<any>(byStrings("UserProfilePopoutWrapper: currentUser"));

class RenderPopout extends Component<RenderPopoutProps & { userId: string, channelId?: string, guildId?: string }, { loaded: boolean }> {
  state = { loaded: false };

  async componentDidMount() {
    try {
      let user = UserStore.getUser(this.props.userId);
      if (!user) user = await fetchUser(this.props.userId);
  
      await preloader.maybeFetchUserProfileForPopout(
        user,
        { guildId: this.props.guildId, channelId: this.props.channelId }
      );
    } catch (error) {
      
    }
    this.setState({ loaded: true });
  }

  render() {
    if (!this.state.loaded) return (
      <div className="vx-loading-popout">
        <Spinner type={Spinner.Type.SPINNING_CIRCLE} />
      </div>
    );
    return (
      <UserPopoutModule {...this.props} channelId={this.props.channelId} guildId={this.props.guildId} />
    )
  }
}

export function UserPopout(props: UserPopoutProps) {
  const userId = typeof props.user === "string" ? props.user : props.user.id;

  return (
    <Popout 
      {...props}
      renderPopout={(renderProps) => {        
        return (
          <RenderPopout {...renderProps} userId={userId} guildId={props.guildId} channelId={props.channelId} />
        )
      }}
    />
  )
}