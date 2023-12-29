import { Channel, Message, Guild, User } from "discord-types/general";
import { addPlainTextPatch } from "../../webpack";
import { GuildStore, useStateFromStores } from "../../webpack/common";

addPlainTextPatch({
  identifier: "VX(Minipopover)",
  match: ".Messages.MESSAGE_UTILITIES_A11Y_LABEL",
  find: /(return .{1,3}\.state!==.{1,3}\.MessageStates\.SEND_FAILED\?)(\(0,.{1,3}\.jsx\)\(.{1,3}{\.{3}.{1,3}}\))(:null)/,
  replace: "$1$vx.minipopover._patchPopover($2)$3"
});

export interface Props { message: Message, channel: Channel, guild?: Guild, author: User };
export const menuPatches = new Map<string, Set<(props: Props) => React.ReactNode>>();

interface MinipopoverType {
  (props: any): React.ReactElement<any, React.FunctionComponent>,
  __VX?: MinipopoverType
};
const cached = new WeakMap<MinipopoverType, MinipopoverType>();

function Minipopover(Original: MinipopoverType, props: Props) {  
  const returnValue = Original(props)!;

  const guild = useStateFromStores([ GuildStore ], () => props.channel.guild_id ? GuildStore.getGuild(props.channel.guild_id) : undefined);  

  for (const [ id, items ] of menuPatches) {
    for (const [ index, Callback ] of Object.entries(Array.from(items))) {
      returnValue.props.children.unshift(
        <Callback 
          channel={props.channel} 
          message={props.message} 
          author={props.message.author}
          guild={guild}
          key={`vx-mp-${props.message.id}-${props.channel.id}-${id}-${index}`}
        />
      );
    };
  };
  
  return returnValue;
};

export function _patchPopover(minipopover: React.ReactElement) {
  const { type } = minipopover as { type: MinipopoverType };

  if (type.__VX) return minipopover;
  if (cached.has(type)) minipopover.type = cached.get(type)!;

  const newType = Minipopover.bind(window, type);
  (newType as MinipopoverType).__VX = type;

  cached.set(type, newType);

  minipopover.type = newType;

  return minipopover;
};