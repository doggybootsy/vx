import { Channel, Message, Guild, User } from "discord-types/general";
import { addPlainTextPatch } from "@webpack";
import { GuildStore, useStateFromStores } from "@webpack/common";

addPlainTextPatch({
  identifier: "VX(Minipopover)",
  match: "Lv7LxM",
  find: /(return .{1,3}\.state!==.{1,3}\..{1,3}\.SEND_FAILED\?)(\(0,.{1,3}\.jsx\)\(.{1,3}{\.{3}.{1,3}}\))(:null)/,
  replace: "$1$vx.minipopover._patchPopover($2)$3"
});

export type Patch = (result: React.ReactElement, props: Omit<Props, "author">) => void;

export interface Props { message: Message, channel: Channel, guild?: Guild, author: User };
export const miniPopoverPatches = new Map<string, Set<Patch>>();

interface MinipopoverType {
  (props: any): React.ReactElement<any, React.FunctionComponent>,
  __VX?: MinipopoverType
};
const cached = new WeakMap<MinipopoverType, MinipopoverType>();

function Minipopover(Original: MinipopoverType, props: Props) {  
  const returnValue = Original(props)!;

  const guild = useStateFromStores([ GuildStore ], () => props.channel.guild_id ? GuildStore.getGuild(props.channel.guild_id) : undefined);  

  for (const [, items ] of miniPopoverPatches) {
    for (const patch of Array.from(items)) {
      patch(returnValue, { ...props, guild });
    }
  }
  
  return returnValue;
}

export function _patchPopover(minipopover: React.ReactElement) {  
  const { type } = minipopover as { type: MinipopoverType };

  if (type.__VX) return minipopover;
  if (cached.has(type)) {
    minipopover.type = cached.get(type)!;
    return minipopover;
  }

  const newType: MinipopoverType = Minipopover.bind(window, type);
  newType.__VX = type;

  cached.set(type, newType);

  minipopover.type = newType;

  return minipopover;
}